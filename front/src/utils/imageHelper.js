import { BASE_URL } from './BASE_URL';

/**
 * Returns a fully qualified URL for images/assets uploaded locally.
 * If the URL is already absolute or is a blob/data URI, it returns it as is.
 * If it's a relative path starting with or containing 'uploads', it prefixes it with the backend host domain.
 * Otherwise (e.g. for empty, null, or dummy mock Latin values), it returns null.
 */
export const getImageUrl = (url) => {
    if (!url) return null;
    
    // Check if it's already a full URL or local preview/data URL
    if (
        url.startsWith('http://') || 
        url.startsWith('https://') || 
        url.startsWith('data:') || 
        url.startsWith('blob:')
    ) {
        return url;
    }
    
    // If it's a relative path under uploads, resolve it properly
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        const serverBase = BASE_URL.replace('/api', '');
        return `${serverBase}${cleanPath}`;
    }
    
    // Fall back to null for mock strings or other unresolvable paths
    return null;
};
