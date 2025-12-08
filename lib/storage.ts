import { supabase } from './supabase';

export type BucketName = 'policy-documents' | 'claim-documents' | 'rc-copies' | 'quote-documents';

/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @returns Promise<string> - Public URL of uploaded file
 */
export async function uploadFile(file: File, bucket: BucketName): Promise<string> {
    try {
        // Generate unique filename to prevent duplicates
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}_${randomStr}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true, // Allow overwriting if file exists
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error: any) {
        console.error('Error uploading file:', error);
        throw new Error(error.message || 'Failed to upload file');
    }
}

/**
 * Upload multiple files to Supabase Storage
 * @param files - Array of files to upload
 * @param bucket - Storage bucket name
 * @returns Promise<string[]> - Array of public URLs
 */
export async function uploadMultipleFiles(
    files: File[],
    bucket: BucketName
): Promise<string[]> {
    try {
        const uploadPromises = files.map((file) => {
            return uploadFile(file, bucket);
        });

        return await Promise.all(uploadPromises);
    } catch (error: any) {
        console.error('Error uploading multiple files:', error);
        throw new Error(error.message || 'Failed to upload files');
    }
}

/**
 * Delete a file from Supabase Storage
 * @param path - Full path to file in storage
 */
export async function deleteFile(path: string): Promise<void> {
    try {
        const { error } = await supabase.storage
            .from('policy-documents')
            .remove([path]);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting file:', error);
        throw new Error(error.message || 'Failed to delete file');
    }
}

/**
 * Generate storage path for policy documents
 */
export function getPolicyStoragePath(
    userId: string,
    policyType: 'motor' | 'gmc' | 'commercial' | 'claims',
    docType: string
): string {
    return `${policyType}_policies/${userId}/${docType}`;
}

/**
 * Create storage bucket if it doesn't exist (run once on setup)
 */
export async function initializeStorage(): Promise<void> {
    try {
        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();

        const bucketExists = buckets?.some((bucket: any) => bucket.name === 'policy-documents');

        if (!bucketExists) {
            // Create bucket
            const { error } = await supabase.storage.createBucket('policy-documents', {
                public: true,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['application/pdf', 'image/*'],
            });

            if (error) {
                console.error('Error creating storage bucket:', error);
            }
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
}
