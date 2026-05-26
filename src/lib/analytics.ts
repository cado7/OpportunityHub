import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface AnalyticsEvent {
  type: string;
  path: string;
  category?: string;
  opportunityId?: string;
  newsId?: string;
  createdAt: any;
}

export async function trackEvent(
  type: string, 
  metadata: { 
    path?: string; 
    category?: string; 
    opportunityId?: string; 
    newsId?: string;
  } = {}
) {
  try {
    const payload: AnalyticsEvent = {
      type,
      path: metadata.path || window.location.pathname,
      createdAt: serverTimestamp(),
    };

    if (metadata.category) {
      payload.category = metadata.category;
    }
    if (metadata.opportunityId) {
      payload.opportunityId = metadata.opportunityId;
    }
    if (metadata.newsId) {
      payload.newsId = metadata.newsId;
    }

    await addDoc(collection(db, 'analytics_events'), payload);
  } catch (err) {
    // Fail silently in staging/production to not interfere with user experience
    console.warn('Analytics logging skipped:', err);
  }
}
