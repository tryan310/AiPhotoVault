import React from 'react';

export enum AppState {
  LOGIN = 'LOGIN',
  LOGIN_FORM = 'LOGIN_FORM',
  REGISTER_FORM = 'REGISTER_FORM',
  OAUTH_CALLBACK = 'OAUTH_CALLBACK',
  DASHBOARD = 'DASHBOARD',
  EMAIL = 'EMAIL',
  PRICING = 'PRICING',
  SUCCESS = 'SUCCESS',
  SAFARI_SUCCESS = 'SAFARI_SUCCESS',
  SETUP = 'SETUP',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  GALLERY = 'GALLERY',
}

export interface Theme {
  id: string;
  title: string;
  prompt: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  stripePriceId: string;
  billingInfo: string[];
  description: string;
  cta: string;
  isPopular?: boolean;
  mainFeatures: string[];
  featuresHeader?: string;
  plusFeatures: { text: string; highlight?: 'bad' | 'medium' | 'good' }[];
  footerHeader: string;
  footerFeatures: string[];
}
