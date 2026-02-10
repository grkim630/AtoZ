import { PhishingCase } from './types';

export const MOCK_STATS = {
  todayReports: 7219,
  todayPrevention: 10324,
  totalReports: 1247219,
};

export const MOCK_PHISHING_CASES: PhishingCase[] = [
  {
    id: '1',
    title: '혹시나 했는데... 위험도 90 퍼센트 나왔네요.',
    description: '제가 어제 받은 문자인데요. 혹시나 해서 여기 업로드...',
    type: 'Message',
    date: '2026-02-10',
    riskLevel: 90,
    viewCount: 23,
    likes: 3,
  },
  {
    id: '2',
    title: '저희 이모 어떡하죠? 스캠 당하신 거 같아요.',
    description: '이모 문자 분석해보니까 전형적인 패턴이라고 하네요...',
    type: 'Romance',
    date: '2026-02-09',
    riskLevel: 85,
    viewCount: 39,
    likes: 2,
  },
  {
    id: '3',
    title: '이런 문자 받으신 분들 조심하세요.',
    description: '최근 유행하는 사기꾼 집단이라고 합니다. 조심하세요...',
    type: 'Voice',
    date: '2026-02-08',
    riskLevel: 95,
    viewCount: 52,
    likes: 6,
// ... existing code ...
  },
];

export const MOCK_NEWS = [
  {
    id: '101',
    title: '신종 보이스피싱 수법 주의보',
    summary: '최근 AI 목소리 변조를 이용한 피싱이 급증하고 있습니다.',
    date: '2026-02-10',
    readCount: 1240,
  },
  {
    id: '102',
    title: '금융감독원, 피싱 예방 교육 강화',
    summary: '노인들을 위한 찾아가는 예방 교육이 실시됩니다.',
    date: '2026-02-09',
    readCount: 850,
  },
    {
    id: '103',
    title: '메신저 피싱, 가족 사칭 주의',
    summary: '가족을 사칭하여 상품권 구매를 유도하는 사례가 늘고 있습니다.',
    date: '2026-02-08',
    readCount: 2300,
  },
];

export const MOCK_FEED = [
  {
    id: 'f1',
    type: 'Voice',
    status: 'Analyzed',
    title: '혹시나 했는데... 위험도 90 퍼센트 나왔네요.',
    content: '제가 어제 받은 문자인데요. 혹시나 해서 여기 업로드...',
    riskScore: 90,
    time: '1분 전',
    views: 23,
    likes: 3,
    comments: 1,
    image: require('../../assets/images/Rectangle 266.png'), 
  },
  {
    id: 'f2',
    type: 'Romance',
    status: 'Analyzed',
    title: '저희 이모 어떡하죠? 스캠 당하신 거 같아요.',
    content: '이모 문자 분석해보니까 전형적인 패턴이라고 하네요...',
    riskScore: 85,
    time: '1분 전',
    views: 39,
    likes: 2,
    comments: 3,
    image: require('../../assets/images/Rectangle 277.png'),
  },
   {
    id: 'f3',
    type: 'Voice',
    status: 'Pending',
    title: '이런 문자 받으신 분들 조심하세요.',
    content: '최근 유행하는 사기꾼 집단이라고 합니다. 조심하세요...',
    riskScore: 0,
    time: '2분 전',
    views: 52,
    likes: 6,
    comments: 5,
    image: null,
  },
];

export const MOCK_NEWS_STATS = {
    weeklyTrend: [20, 45, 28, 80, 50, 43, 60], // Visualization data
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const MOCK_GALLERY_ITEMS = [
    {
        id: 'g1',
        title: '전화 사기(시뮬레이션)',
        description: '실제 보이스피싱범의 목소리로 체험해보세요.',
        icon: 'call',
        color: '#4CD964',
    },
    {
        id: 'g2',
        title: '메세지 사기(시뮬레이션)',
        description: '스미싱 문자를 직접 받고 대처해보세요.',
        icon: 'chatbubble',
        color: '#5AC8FA',
    },
    {
         id: 'g3',
         title: '예방안, 대응안',
         description: '피해 발생 시 대처 요령을 익혀두세요.',
         icon: 'shield-checkmark',
         color: '#FFCC00',
    }
];
