import { Colors } from '@/constants/theme';
export declare function useThemeColor(props: {
    light?: string;
    dark?: string;
}, colorName: keyof typeof Colors.light & keyof typeof Colors.dark): any;
