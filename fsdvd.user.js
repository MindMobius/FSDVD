// ==UserScript==
// @name         FSDVD - 飞书文档视频下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  飞书文档视频下载工具
// @author       YourName
// @match        https://*.feishu.cn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 获取所有视频元素
    function getAllVideoElements() {
        const videoBlocks = document.querySelectorAll('div[data-block-type="view"]');
        
        const videos = [];
        videoBlocks.forEach(block => {
            const fileNameElement = block.querySelector('.file-name');
            if (fileNameElement) {
                videos.push({
                    element: block,
                    name: fileNameElement.textContent.trim(),
                });
            }
        });
        
        return videos;
    }

    // 创建视频列表弹窗
    function createVideoListPopup(videos) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.width = '500px';
        popup.style.maxHeight = '80vh';
        popup.style.backgroundColor = 'white';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        popup.style.padding = '20px';
        popup.style.zIndex = '9999';
        popup.style.overflow = 'auto';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '15px';
        closeBtn.style.top = '15px';
        closeBtn.style.border = 'none';
        closeBtn.style.background = 'none';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => document.body.removeChild(popup));
        popup.appendChild(closeBtn);

        const title = document.createElement('h3');
        title.textContent = '文档中的视频文件';
        title.style.marginBottom = '20px';
        popup.appendChild(title);

        const list = document.createElement('ul');
        list.style.listStyle = 'none';
        list.style.padding = '0';
        list.style.margin = '0';

        videos.forEach(video => {
            const item = document.createElement('li');
            item.style.padding = '10px';
            item.style.borderBottom = '1px solid #eee';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';

            const name = document.createElement('span');
            name.textContent = video.name;
            item.appendChild(name);

            // 修改这里：调用createDownloadButton而不是直接创建按钮
            const downloadBtn = createDownloadButton(video);
            item.appendChild(downloadBtn);

            list.appendChild(item);
        });

        popup.appendChild(list);
        document.body.appendChild(popup);
    }

    // 修改getVideoDownloadOptions函数
    async function getVideoDownloadOptions(videoElement) {
        // 确保点击的是正确的预览按钮
        const previewBtn = videoElement.closest('.file-block').querySelector('.btn-preview');
        if (previewBtn) {
            previewBtn.click();
            
            // 等待选项列表出现
            return new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    const optionsList = document.querySelector('.xg-options-list:not(.hide)');
                    if (optionsList) {
                        clearInterval(checkInterval);
                        
                        // 提取所有下载选项
                        const options = Array.from(optionsList.querySelectorAll('.option-item'))
                            .filter(item => item.getAttribute('url'))
                            .map(item => ({
                                text: item.getAttribute('showtext') || '下载',
                                url: item.getAttribute('url'),
                                quality: item.getAttribute('definition')
                            }));
                        
                        // 关闭选项列表
                        const closeBtn = optionsList.querySelector('.close-btn');
                        if (closeBtn) closeBtn.click();
                        
                        resolve(options.length > 0 ? options : null);
                    }
                }, 200);
                
                // 设置超时
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve(null);
                }, 3000);
            });
        }
        return null;
    }

    // 主函数
    function main() {
        // 创建主按钮
        const mainBtn = document.createElement('button');
        mainBtn.textContent = '显示视频列表';
        mainBtn.style.position = 'fixed';
        mainBtn.style.bottom = '20px';
        mainBtn.style.right = '20px';
        mainBtn.style.padding = '10px 20px';
        mainBtn.style.backgroundColor = '#3370ff';
        mainBtn.style.color = 'white';
        mainBtn.style.border = 'none';
        mainBtn.style.borderRadius = '4px';
        mainBtn.style.cursor = 'pointer';
        mainBtn.style.zIndex = '9998';
        
        mainBtn.addEventListener('click', () => {
            const videos = getAllVideoElements();
            createVideoListPopup(videos);
        });

        document.body.appendChild(mainBtn);
    }

    // 页面加载完成后执行
    window.addEventListener('load', main);

    // 获取视频下载选项
    async function getVideoDownloadOptions(videoElement) {
        // 点击视频元素展开选项
        const previewBtn = videoElement.querySelector('.btn-preview');
        if (previewBtn) previewBtn.click();
        
        // 等待选项列表出现
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                const optionsList = document.querySelector('.xg-options-list:not(.hide)');
                if (optionsList) {
                    clearInterval(checkInterval);
                    
                    // 提取所有下载选项
                    const options = Array.from(optionsList.querySelectorAll('.option-item')).map(item => ({
                        text: item.getAttribute('showtext'),
                        url: item.getAttribute('url'),
                        quality: item.getAttribute('definition')
                    }));
                    
                    // 关闭选项列表
                    const closeBtn = document.querySelector('.xg-options-list:not(.hide) .close-btn');
                    if (closeBtn) closeBtn.click();
                    
                    resolve(options);
                }
            }, 200);
        });
    }

    // 创建下载按钮
    function createDownloadButton(video) {
        const btn = document.createElement('button');
        btn.textContent = '下载';
        btn.style.padding = '5px 10px';
        btn.style.backgroundColor = '#3370ff';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        
        btn.addEventListener('click', async () => {
            const options = await getVideoDownloadOptions(video.element);
            if (options && options.length > 0) {
                // 创建选项弹窗
                const optionPopup = document.createElement('div');
                optionPopup.style.position = 'fixed';
                optionPopup.style.top = '50%';
                optionPopup.style.left = '50%';
                optionPopup.style.transform = 'translate(-50%, -50%)';
                optionPopup.style.backgroundColor = 'white';
                optionPopup.style.padding = '20px';
                optionPopup.style.borderRadius = '8px';
                optionPopup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                optionPopup.style.zIndex = '10000';
                
                const title = document.createElement('h4');
                title.textContent = `选择下载清晰度: ${video.name}`;
                optionPopup.appendChild(title);
                
                options.forEach(option => {
                    const optionBtn = document.createElement('button');
                    optionBtn.textContent = option.text;
                    optionBtn.style.display = 'block';
                    optionBtn.style.width = '100%';
                    optionBtn.style.margin = '5px 0';
                    optionBtn.style.padding = '8px 16px';
                    optionBtn.style.backgroundColor = '#3370ff';
                    optionBtn.style.color = 'white';
                    optionBtn.style.border = 'none';
                    optionBtn.style.borderRadius = '4px';
                    
                    optionBtn.addEventListener('click', () => {
                        window.open(option.url, '_blank');
                        document.body.removeChild(optionPopup);
                    });
                    
                    optionPopup.appendChild(optionBtn);
                });
                
                document.body.appendChild(optionPopup);
            }
        });
        
        return btn;
    }
})();