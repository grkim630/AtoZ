import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

// SVG Icons
import CommunityActive from '@/assets/icons/community.svg';
import CommunityInactive from '@/assets/icons/community_g.svg';
import GalleryActive from '@/assets/icons/gallery.svg';
import GalleryInactive from '@/assets/icons/gallery_g.svg';
import HomeActive from '@/assets/icons/home.svg';
import HomeInactive from '@/assets/icons/home_g.svg';
import MyPageActive from '@/assets/icons/my.svg';
import MyPageInactive from '@/assets/icons/my_g.svg';
import NewsActive from '@/assets/icons/news.svg';
import NewsInactive from '@/assets/icons/news_g.svg';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export const TabIcons = {
  Home: {
    Active: HomeActive,
    Inactive: HomeInactive,
  },
  News: {
    Active: NewsActive,
    Inactive: NewsInactive,
  },
  Community: {
    Active: CommunityActive,
    Inactive: CommunityInactive,
  },
  Gallery: {
    Active: GalleryActive,
    Inactive: GalleryInactive,
  },
  MyPage: {
    Active: MyPageActive,
    Inactive: MyPageInactive,
  },
};

export const Icons = {
  // ... Keep existing icons for other uses if needed, or remove if fully replaced in tabs
  Alert: {
    Name: 'notifications-outline' as IoniconsName,
    Type: Ionicons,
  },
  Upload: {
    Name: 'cloud-upload' as IoniconsName,
    Type: Ionicons,
  },
  Check: {
    Name: 'checkmark-circle' as IoniconsName,
    Type: Ionicons,
  },
  Warning: {
    Name: 'warning' as IoniconsName,
    Type: Ionicons,
  },
  // Utility Icons used in screens
  Chat: {
    Name: 'chatbubbles' as IoniconsName,
    Type: Ionicons,
  },
  Chevron: {
    Name: 'chevron-forward' as IoniconsName,
    Type: Ionicons,
  },
  Image: {
    Name: 'image-outline' as IoniconsName,
    Type: Ionicons,
  },
  // Re-exporting Ionicons for non-tab usage
  Ionicons,
};

