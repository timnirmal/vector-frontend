export interface CompatibilityResponse {
    compatibility_score: number;
    strengths: string[];
    potential_concerns: string[];
    work_style_indicators: string[];
    culture_fit_aspects: string[];
    adaptability_signals: string[];
    next_steps: string;
}

export interface ChatMessage {
    sender: "user" | "agent";
    content: string;
    timestamp: Date;
}

export interface InterviewAnalysisResponse {
    overall_score: number;
    key_strengths: string[];
    areas_of_improvement: string[];
    response_quality: {
        clarity: number;
        completeness: number;
        relevance: number;
    };
    themes_identified: string[];
    recommendations_for_hiring_manager: string[];
    final_recommendation: string;
}