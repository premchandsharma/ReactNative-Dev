export type StoryGroup = {
    ringColor: string;
    thumbnail: string;
    name: string;
};
export type StoryGroupData = {
    ringColor: string;
    thumbnail: string;
    name: string;
};
export type CampaignFloater = {
    id: string;
    campaign_type: 'FLT';
    details: {
        id: string;
        image: string;
        link: string | null;
        width: null | number;
        height: null | number;
        position: null | string;
    };
};
export type CampaignStory = {
    id: string;
    campaign_type: 'STR';
    details: [
        {
            id: string;
            name: string;
            thumbnail: string;
            ringColor: string;
            nameColor: string;
            order: number;
            slides: [
                {
                    id: string;
                    parent: string;
                    image: null | string;
                    video: null | string;
                    link: null | string;
                    button_text: null | string;
                    order: number;
                    content: string | null;
                }
            ];
        }
    ];
};
export type CampaignBanner = {
    id: string;
    campaign_type: 'BAN';
    details: {
        id: string;
        image: string;
        width: null | number;
        height: null | number;
        link: null | string;
    };
};
export type CampaignPip = {
    id: string;
    campaign_type: 'PIP';
    details: {
        id: string;
        small_video: string;
        height: null | number;
        width: null | number;
        large_video: string;
        link: string | null;
        button_text: string | null;
        position: null | string;
        campaign: string;
        screen: number;
    };
};
export type CampaignSurvey = {
    id: string;
    campaign_type: 'SUR';
    details: {
        id: string;
        name: string;
        responses: number;
        styling: {
            [key: string]: string;
        };
        surveyQuestion: string;
        surveyOptions: {
            [key: string]: string;
        };
        campaign: string;
        hasOthers: boolean;
        screen: string;
    };
};
export type CampaignCsat = {
    id: string;
    campaign_type: 'CSAT';
    details: {
        id: string;
        title: string;
        styling: {
            [key: string]: string;
        };
        thankyouImage: string;
        thankyouText: string;
        thankyouDescription: string;
        description_text: string;
        feedback_option: {
            [key: string]: string;
        };
        campaign: string;
        screen: number;
    };
};
export type CampaignWidgets = {
    id: string;
    campaign_type: 'WID';
    details: {
        id: string;
        type: string;
        height: number;
        widget_images: [
            {
                id: string;
                image: string;
                link: string;
                order: number;
            }
        ];
        campaign: string;
    };
};
export type UserData = {
    campaigns: Array<CampaignFloater | CampaignStory | CampaignBanner | CampaignPip | CampaignSurvey | CampaignCsat | CampaignWidgets>;
    user_id: string;
};
declare class AppStorys {
    private static instance;
    private campaigns;
    private data;
    static getInstance(): AppStorys;
    trackScreen(app_id: string, screen_name: string): Promise<any[]>;
    trackUser(user_id: string, attributes?: any): Promise<void>;
    trackUserAction(user_id: string, campaign_id: string, action: any): Promise<void>;
    verifyUser(user_id: string, attributes?: any): Promise<UserData | undefined>;
    verifyAccount(account_id: string, app_id: string): Promise<void>;
    CaptureSurveyResponse(userId: string, surveyId: string, responseOptions: string[], comment?: string): Promise<void>;
    CaptureCsatResponse(userId: string, csatId: string, rating: number, feedbackOption?: string, additionalComments?: string): Promise<void>;
    initialize(app_id: string, account_id: string, user_id: string, screen_name: string, attributes?: any): Promise<UserData | undefined>;
    static Stories: import("react").FC<UserData>;
    static StoryScreen: () => import("react/jsx-runtime").JSX.Element;
    static Floater: import("react").FC<UserData>;
    static Pip: import("react").FC<UserData>;
    static PipScreen: () => import("react/jsx-runtime").JSX.Element;
    static Banner: import("react").FC<UserData>;
    static Survey: import("react").FC<UserData>;
    static Csat: import("react").FC<UserData>;
    static Widgets: import("react").FC<UserData>;
}
declare const _default: AppStorys;
export default _default;
//# sourceMappingURL=sdk.d.ts.map