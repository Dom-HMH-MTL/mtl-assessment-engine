import { ProblemResponseDao as DAO } from '../dao/ProblemResponseDao';
import { Problem } from '../model/Problem';
import { ProblemResponse as Model } from '../model/ProblemResponse';
import { FeedbackType, matchers, ResponseValidation, Strategy } from '../model/ResponseValidation';
import { injectVariables } from '../model/VariableHelpers';
import { BaseService } from './BaseService';
import { ProblemService as AssociatedService } from './ProblemService';

import { JSDOM } from 'jsdom';

export class ProblemResponseService extends BaseService<DAO> {
    public static getInstance(): ProblemResponseService {
        if (!ProblemResponseService.instance) {
            ProblemResponseService.instance = new ProblemResponseService();
        }
        return ProblemResponseService.instance;
    }

    private static instance: ProblemResponseService;
    private associatedService: AssociatedService;

    private constructor() {
        super(DAO.getInstance());
        this.associatedService = AssociatedService.getInstance();
    }

    public async create(candidate: Model, metadata?: { [key: string]: string }): Promise<string> {
        const problem: Problem = await this.associatedService.get(
            candidate.problemId,
            { mode: 'lesson' }, // To skip the filtering out of the <response-validation/> tags
            Object.assign({}, metadata, { recursiveResolution: 'true' })
        );
        // FIXME: do not only process 'en' language
        // FIXME: Address all problem steps, not just the first one...
        const template: DocumentFragment = this.getFragment(injectVariables(problem.templates[0].text.en, candidate.variables));

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
                evaluations[id] = ResponseValidation.getInstance().fromHttp({
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

        return super.create(candidate, metadata);
    }

    private getFragment(html: string, jsDomLib: any = JSDOM): DocumentFragment {
        return jsDomLib.fragment(html);
    }

    private getRespnseValidations(template: DocumentFragment): Map<string, ResponseValidation[]> {
        const collectInfos = (parent: Node, accumulator: Map<string, ResponseValidation[]>): Map<string, ResponseValidation[]> => {
            const infos: ResponseValidation[] = [];
            let child: Element = parent.firstChild as Element;
            while (child) {
                if (child.nodeName.toLowerCase() === 'response-validation') {
                    // Stop condition
                    infos.push(
                        ResponseValidation.getInstance().fromHttp({
                            expected: child.getAttribute('expected'),
                            feedbackType: child.getAttribute('feedback-type') as FeedbackType,
                            score: parseInt(child.getAttribute('score') || '0', 10),
                            strategy: child.getAttribute('strategy') as Strategy
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
