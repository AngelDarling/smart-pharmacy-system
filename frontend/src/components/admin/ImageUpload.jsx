import React, { useState, useRef } from 'react';
import { Upload, message, Image, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../api/client.js';

const ImageUpload = ({ value = [], onChange, maxCount = 10 }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const uploadedUrlsRef = useRef([]);

    // Convert URLs to file list format when value changes
    React.useEffect(() => {
        if (value && value.length > 0) {
            const list = value.map((url, index) => ({
                uid: `-${index}`,
                name: `image-${index}`,
                status: 'done',
                url: url
            }));
            setFileList(list);
            uploadedUrlsRef.current = value;
        } else {
            setFileList([]);
            uploadedUrlsRef.current = [];
        }
    }, [value]);

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const imageUrl = response.data.url;

            // Add to ref to track all uploaded URLs
            uploadedUrlsRef.current = [...uploadedUrlsRef.current, imageUrl];

            // Update parent with all uploaded URLs
            onChange([...uploadedUrlsRef.current]);

            message.success('Upload ảnh thành công!');
            return imageUrl;
        } catch (error) {
            console.error('Upload error:', error);
            message.error('Upload ảnh thất bại: ' + (error.response?.data?.message || error.message));
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (file) => {
        const newUrls = uploadedUrlsRef.current.filter((url) => url !== file.url);
        uploadedUrlsRef.current = newUrls;
        onChange(newUrls);
    };

    const handlePreview = (file) => {
        setPreviewImage(file.url);
        setPreviewVisible(true);
    };

    const customRequest = async ({ file, onSuccess, onError }) => {
        try {
            const url = await handleUpload(file);
            onSuccess({ url }, file);
        } catch (error) {
            onError(error);
        }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <>
            <Upload
                listType="picture-card"
                fileList={fileList}
                customRequest={customRequest}
                onRemove={handleRemove}
                onPreview={handlePreview}
                multiple
                accept="image/*"
                disabled={uploading}
            >
                {value && value.length >= maxCount ? null : uploadButton}
            </Upload>

            {previewVisible && (
                <Image
                    preview={{
                        visible: previewVisible,
                        onVisibleChange: (visible) => setPreviewVisible(visible),
                        src: previewImage
                    }}
                    style={{ display: 'none' }}
                />
            )}

            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>
                Có thể upload tối đa {maxCount} ảnh. Đã upload: {value?.length || 0}/{maxCount}
            </div>
        </>
    );
};

export default ImageUpload;
