import { ProblemDao as AssociatedDAO } from '../dao/ProblemDao';
import { ProblemResponseDao as DAO } from '../dao/ProblemResponseDao';
import { Problem } from '../model/Problem';
import { ProblemResponse as Model } from '../model/ProblemResponse';
import { FeedbackType, matchers, ResponseValidation, Strategy } from '../model/ResponseValidation';
import { injectVariables } from '../model/VariableHelpers';
import { BaseService } from './BaseService';

import { JSDOM } from 'jsdom';

export class ProblemResponseService extends BaseService<DAO> {
    public static getInstance(): ProblemResponseService {
        if (!ProblemResponseService.instance) {
            ProblemResponseService.instance = new ProblemResponseService();
        }
        return ProblemResponseService.instance;
    }

    private static instance: ProblemResponseService;
    private associatedDao: AssociatedDAO;

    private constructor() {
        super(DAO.getInstance());
        this.associatedDao = AssociatedDAO.getInstance();
    }

    /* istanbul ignore next */
    public async create(candidate: Model, metadata?: { [key: string]: string }): Promise<string> {
        const problem: Problem = await this.associatedDao.get(candidate.problemId);
        const template: DocumentFragment = JSDOM.fragment(injectVariables(problem.template[0], candidate.variables));
        // FIXME: Address all problem steps, not just the first one...

        const validationGroups: Map<string, ResponseValidation[]> = this.getRespnseValidations(template);

        const evaluations: { [id: string]: ResponseValidation } = {};
        for (const [id, validations] of validationGroups) {
            const response: any = candidate.values[id];
            for (const validation of validations) {
                if (validation.expected === null || matchers.get(validation.strategy)(validation, response)) {
                    evaluations[id] = validation;
                    break;
                }
            }
            if (evaluations[id] === undefined) {
                evaluations[id] = Object.assign(new ResponseValidation(), {
                    expected: null,
                    feedbackType: FeedbackType.NEGATIVE,
                    score: 0,
                    strategy: null
                });
            }
        }

        let feedbackType: FeedbackType = FeedbackType.POSITIVE;
        let totalScore: number = 0;
        let negativeScore: number = 0;
        for (const evaluation of Object.values(evaluations)) {
            if (evaluation.feedbackType === FeedbackType.NEGATIVE) {
                feedbackType = FeedbackType.NEGATIVE;
                negativeScore += evaluation.score;
            } else {
                totalScore += evaluation.score;
            }
        }
        candidate.evaluations = evaluations;
        candidate.feedbackType = feedbackType;
        candidate.score = feedbackType === FeedbackType.NEGATIVE ? negativeScore : totalScore;

        // return super.create(candidate, metadata);
        return '111-' + problem.id; // FIXME: temporary shortcut while information about the author (a request header) is conveyed out by the base server logic...
    }

    private getRespnseValidations(template: DocumentFragment): Map<string, ResponseValidation[]> {
        const collectInfos = (parent: Node, accumulator: Map<string, ResponseValidation[]>): Map<string, ResponseValidation[]> => {
            const infos: ResponseValidation[] = [];
            let child: Element = parent.firstChild as Element;
            while (child) {
                if (child.nodeName.toLowerCase() === 'response-validation') {
                    // Stop condition
                    infos.push(
                        Object.assign(new ResponseValidation(), {
                            expected: child.getAttribute('expected'),
                            feedbackType: child.getAttribute('feedback-type') as FeedbackType,
                            score: parseInt(child.getAttribute('score') || '0', 10),
                            strategy: (child.getAttribute('strategy') || Strategy.EXACT_MATCH) as Strategy
                        })
                    );
                } else if (0 < child.childNodes.length) {
                    // Recursive loop (if any `chlid`)
                    collectInfos(child, accumulator);
                }
                child = child.nextSibling as Element;
            }
            if (0 < infos.length) {
                accumulator.set((parent as Element).id, infos);
            }
            return accumulator;
        };

        return collectInfos(template, new Map());
    }
}
