import { supabase } from './supabase';

/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param path - Storage path (e.g., 'motor_policies/user123/rc_docs/file.pdf')
 * @returns Promise<string> - Public URL of uploaded file
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    try {
        const { data, error } = await supabase.storage
            .from('policy-documents')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('policy-documents')
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
 * @param basePath - Base storage path (e.g., 'motor_policies/user123/rc_docs')
 * @returns Promise<string[]> - Array of public URLs
 */
export async function uploadMultipleFiles(
    files: File[],
    basePath: string
): Promise<string[]> {
    try {
        const uploadPromises = files.map((file, index) => {
            const fileName = `${Date.now()}_${index}_${file.name}`;
            const path = `${basePath}/${fileName}`;
            return uploadFile(file, path);
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

        const bucketExists = buckets?.some(bucket => bucket.name === 'policy-documents');

        if (!bucketExists) {
            // Create bucket
            const { error } = await supabase.storage.createBucket('policy-documents', {
                public: true,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['application/pdf', 'image/*'],
            });

            if (error) {
                console.error('Error creating storage bucket:', error);
            } else {
                console.log('Storage bucket created successfully');
            }
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
}
