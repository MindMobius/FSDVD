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

            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = '下载';
            downloadBtn.style.padding = '5px 10px';
            downloadBtn.style.backgroundColor = '#3370ff';
            downloadBtn.style.color = 'white';
            downloadBtn.style.border = 'none';
            downloadBtn.style.borderRadius = '4px';
            downloadBtn.style.cursor = 'pointer';
            downloadBtn.addEventListener('click', () => {
                console.log('下载视频:', video.name);
                // TODO: 实现下载逻辑
            });
            item.appendChild(downloadBtn);

            list.appendChild(item);
        });

        popup.appendChild(list);
        document.body.appendChild(popup);
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
})();