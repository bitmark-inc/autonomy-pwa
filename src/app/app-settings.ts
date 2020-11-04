export class AppSettings {
  public static DEFAULT_CHART_COLOR = '#EEEEEE';
  public static CHART_COLORS: string[] = ['#00B0DA', '#FDB515', '#EE1F60','#CFDD45', '#D9661F', '#00A598'];
  public static PLACE_NONE_COLOR: string = '#DDD5C7';
  public static PLACE_LIGHT_COLORS: {from: number, to: number, code: string}[] = [
    {from: 0, to: 1.5, code: '#E59898'},
    {from: 1.6, to: 2.5, code: '#EDBD95'},
    {from: 2.6, to: 3.5, code: '#F3D98B'},
    {from: 3.6, to: 4.5, code: '#CCE09F'},
    {from: 4.6, to: 5, code: '#96E49B'}
  ];
  public static PLACE_DARK_COLORS: {from: number, to: number, code: string}[] = [
    {from: 0, to: 1.5, code: '#CC3232'},
    {from: 1.6, to: 2.5, code: '#DB7B2B'},
    {from: 2.6, to: 3.5, code: '#E7B416'},
    {from: 3.6, to: 4.5, code: '#99C140'},
    {from: 4.6, to: 5, code: '#2DC937'}
  ];
  public static RESOURCE_RATINGS: string[] = [
    'requires_face_masks',
    'checks_temperature',
    'provides_hand-washing_facilities',
    'disinfects_equipment',
    'reinforces_physical_distancing'
  ];
  public static SURVEY_ANSWERS = {
    excellent: { id: 1, value: 'Excellent' },
    veryGood: { id: 2, value: 'Very Good' },
    good: { id: 3, value: 'Good' },
    fair: { id: 4, value: 'Fair' },
    poor: { id: 5, value: 'Poor' },

    yes: { id: 1, value: 'Yes' },
    no: { id: 2, value: 'No' },
    maybe: { id: 3, value: 'Maybe' },

    alreadyGotIt: { id: 1, value: 'Already got it' },
    yesVer2: { id: 2, value: 'Yes' },
    maybeVer2: { id: 3, value: 'Maybe' },
    noVer2: { id: 4, value: 'No' },

    once: { id: 1, value: 'Once per week' },
    from2To3: { id: 2, value: '2-3 times per week' },
    from4To5: { id: 3, value: '4-5 times per week' },
    from6: { id: 4, value: '6+ times per week' },

    from0To5: { id: 1, value: '0-5' },
    from5To10: { id: 2, value: '5-10' },
    from11To20: { id: 3, value: '11-20' },
    from20: { id: 4, value: '20+' },

    from2To4People: { id: 1, value: '2-4' },
    from5To10People: { id: 2, value: '5-10' },
    from11To15People: { id: 3, value: '11-15' },
    from16To20People: { id: 4, value: '16-20' },
    from20People: { id: 5, value: 'Over 20' },

    outside: { id: 1, value: 'Outside' },
    inside: { id: 2, value: 'Inside' },
    mixed: { id: 3, value: 'Mixed (outside and inside)' },

    postive: { id: 1, value: 'Positive' },
    negative: { id: 2, value: 'Negative' },
    waitResult: { id: 3, value: 'Still waiting for the result' },
    neverGotResult: { id: 7, value: 'Never got the result' },

    '3a1': { id: '3a1', value: 'Healthcare' },
    '3a2': { id: '3a2', value: 'Transportation' },
    '3a3': { id: '3a3', value: 'Grocery store' },
    '3a4': { id: '3a4', value: 'Restaurant or bar' } ,
    '3a5': { id: '3a5', value: 'Construction' },
    '3a6': { id: '3a6', value: 'Delivery' },
    '3a7': { id: '3a7', value: 'Cleaning or janitorial' },
    '3a8': { id: '3a8', value: 'Public servant (EMT, police, firefighter)' },
    '3a9': { id: '3a9', value: 'School or daycare' },
    '3a10': { id: '3a10', value: 'Tech company' },

    always: { id: 1, value: 'Always' },
    mostly: { id: 2, value: 'Mostly' },
    sometimes: { id: 3, value: 'Sometimes' },
    never: { id: 4, value: 'Never' },

    decline: { id: 7, value: 'Decline to answer' },
    notAnswer: { id: 9, value: '' }
  }
  public static SURVEY_DEMOGRAPHIC_ANSWERS = {
    lessThan18: { id: 1, value: 'Less than 18' },
    from18To30: { id: 2, value: '18-30' },
    from31To40: { id: 3, value: '31-40' },
    from41To50: { id: 4, value: '41-50' },
    from51To60: { id: 5, value: '51-60' },
    from61To70: { id: 6, value: '61-70' },
    over70: { id: 7, value: 'Over 70' },

    female: { id: 1, value: 'Female' },
    male: { id: 2, value: 'Male' },
    transMale: { id: 3, value: 'Trans male' },
    transFemale: { id: 4, value: 'Trans female' },
    queer: { id: 5, value: 'Queer/non-binary' },
    other: { id: 6, value: 'Other' },

    latinx: { id: 1, value: 'Latinx' },
    blackAmerican: { id: 2, value: 'Black/African American' },
    asianAmericam: { id: 3, value: 'Asian/Asian American' },
    white: { id: 4, value: 'Caucasian/White' },
    nativeAmerican: { id: 5, value: 'Native American' },
    nativeHawaiian: { id: 6, value: 'Native Hawaiian or Pacific Islander' },
    multi: { id: 7, value: 'Multi-ethnic' },
    otherEthnic: { id: 8, value: 'Other' },

    income25: { id: 1, value: '<$25,000' },
    income25To35: { id: 2, value: '$25,000-$35,000' },
    income35To50: { id: 3, value: '$35,001-$50,000' },
    income50To100: { id: 4, value: '$50,001-$100,000' },
    income100: { id: 5, value: '>$100,000' },

    thinking01: { id: 1, value: 'Strongly agree' },
    thinking02: { id: 2, value: 'Somewhat agree' },
    thinking03: { id: 3, value: 'Agree' },
    thinking04: { id: 4, value: 'Somewhat disagree' },
    thinking05: { id: 5, value: 'Strongly disagree' },

    decline: { id: 77, value: 'Decline to answer' },
    notAnswer: { id: 99, value: '' }
  }
  public static MONTHLY_SURVEY_ANSWERS = {
    excellent: { id: 1, value: 'Excellent' },
    veryGood: { id: 2, value: 'Very Good' },
    Good: { id: 3, value: 'Good' },
    Fair: { id: 4, value: 'Fair' },
    Poor: { id: 5, value: 'Poor' },

    better: { id: 1, value: 'Better' },
    same: { id: 2, value: 'About the same' },
    worse: { id: 3, value: 'Worse' },
    notKnow: { id: 4, value: 'Don’t know' },

    notAtAll: { id: 1, value: 'Not at all' },
    slightly: { id: 2, value: 'Slightly' },
    moderately: { id: 3, value: 'Moderately' },
    quiteABit: { id: 4, value: 'Quite a bit' },
    extremely: { id: 5, value: 'Extremely' },

    decline: { id: 7, value: 'Decline to answer' },
    notAnswer: { id: 9, value: '' }
  }
}
