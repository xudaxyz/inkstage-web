import apiClient from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';
import type {GenderEnum} from "../types/enums";

// 用户信息类型定义
export interface UserInfo {
  id: number;
  name: string;
  nickname: string;
  email: string;
  avatar: string;
  coverImage: string;
  signature: string;
  gender: GenderEnum;
  birthDate?: string;
  location?: string;
  articleCount: number;
  likeCount: number;
  commentCount: number;
  followerCount: number;
  followCount: number;
  registerTime: string;
}

// 获取用户公开资料
export const getUserPublicProfile = async (userId: string): Promise<UserInfo> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.USER.PUBLIC_PROFILE(userId));
    return response.data;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    throw error;
  }
};

// 获取当前用户资料
export const getCurrentUserProfile = async (): Promise<UserInfo> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  } catch (error) {
    console.error('获取当前用户资料失败:', error);
    throw error;
  }
};

// 更新用户资料
export const updateUserProfile = async (userData: Partial<UserInfo>): Promise<UserInfo> => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.USER.PROFILE, userData);
    return response.data;
  } catch (error) {
    console.error('更新用户资料失败:', error);
    throw error;
  }
};
