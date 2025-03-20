/**
 * 資源載入管理器
 * 負責管理遊戲資源的載入、預加載與緩存
 */
export class ResourceLoadManager {
    constructor(eventSystem) {
        this.events = eventSystem;
        this.loadedResources = new Map();
        this.loadingPromises = new Map();

        // 資源層級定義
        this.resourceLayers = {
            CORE: 0, // 核心引擎 (~180KB)
            CURRENT_AREA: 1, // 當前區域資源
            ADJACENT_AREAS: 2, // 相鄰區域資源
            VISUAL: 3, // 視覺增強資源
            AUDIO: 4, // 音頻資源
        };

        // 資源映射配置
        this.resourceMapping = {
            core: [
                { type: "js", path: "core/utils.js" },
                { type: "css", path: "ui/styles/core.css" },
            ],
            areas: {
                harmony_village: [
                    { type: "json", path: "areas/village/main.json" },
                    { type: "json", path: "areas/village/npcs.json" },
                    { type: "json", path: "areas/village/dialogues.json" },
                ],
                chaotic_forest: [
                    { type: "json", path: "areas/forest/main.json" },
                    { type: "json", path: "areas/forest/npcs.json" },
                    { type: "json", path: "areas/forest/dialogues.json" },
                ],
                forgotten_temple: [
                    { type: "json", path: "areas/temple/main.json" },
                    { type: "json", path: "areas/temple/npcs.json" },
                    { type: "json", path: "areas/temple/dialogues.json" },
                ],
            },
            adjacent: {
                harmony_village: ["chaotic_forest"],
                chaotic_forest: ["harmony_village", "forgotten_temple"],
                forgotten_temple: ["chaotic_forest"],
            },
        };
    }

    /**
     * 載入核心資源
     * @returns {Promise} 載入完成的Promise
     */
    async loadCoreResources() {
        this.events.trigger("resources:loadingStarted", { layer: "core" });

        try {
            const coreResources = this.resourceMapping.core;
            const loadPromises = coreResources.map((resource) =>
                this.loadResource(resource.path, this.resourceLayers.CORE)
            );

            await Promise.all(loadPromises);

            this.events.trigger("resources:loadingCompleted", {
                layer: "core",
                resourceCount: coreResources.length,
            });

            return true;
        } catch (error) {
            this.events.trigger("resources:loadingFailed", {
                layer: "core",
                error,
            });
            throw error;
        }
    }

    /**
     * 載入特定區域資源
     * @param {string} areaId - 區域ID
     * @returns {Promise} 載入完成的Promise
     */
    async loadAreaResources(areaId) {
        this.events.trigger("resources:loadingStarted", {
            layer: "area",
            areaId,
        });

        try {
            const areaResources = this.resourceMapping.areas[areaId];
            if (!areaResources) {
                throw new Error(`未定義的區域資源: ${areaId}`);
            }

            const loadPromises = areaResources.map((resource) =>
                this.loadResource(
                    resource.path,
                    this.resourceLayers.CURRENT_AREA
                )
            );

            await Promise.all(loadPromises);

            this.events.trigger("resources:loadingCompleted", {
                layer: "area",
                areaId,
                resourceCount: areaResources.length,
            });

            return true;
        } catch (error) {
            this.events.trigger("resources:loadingFailed", {
                layer: "area",
                areaId,
                error,
            });
            throw error;
        }
    }

    /**
     * 預載相鄰區域資源
     * @param {string} currentAreaId - 當前區域ID
     */
    preloadAdjacentAreas(currentAreaId) {
        const adjacentAreas =
            this.resourceMapping.adjacent[currentAreaId] || [];

        adjacentAreas.forEach((areaId) => {
            // 使用低優先級載入相鄰區域
            this.events.trigger("resources:preloadingStarted", { areaId });

            const areaResources = this.resourceMapping.areas[areaId];
            if (!areaResources) return;

            // 使用 requestIdleCallback 在瀏覽器空閒時載入
            if ("requestIdleCallback" in window) {
                requestIdleCallback(() => {
                    areaResources.forEach((resource) => {
                        this.loadResource(
                            resource.path,
                            this.resourceLayers.ADJACENT_AREAS,
                            true // 靜默模式，不觸發事件
                        );
                    });
                });
            } else {
                // 降級方案
                setTimeout(() => {
                    areaResources.forEach((resource) => {
                        this.loadResource(
                            resource.path,
                            this.resourceLayers.ADJACENT_AREAS,
                            true
                        );
                    });
                }, 2000);
            }
        });
    }

    /**
     * 載入單個資源
     * @param {string} path - 資源路徑
     * @param {number} layer - 資源層級
     * @param {boolean} silent - 是否靜默載入（不觸發事件）
     * @returns {Promise} 載入完成的Promise
     */
    async loadResource(path, layer, silent = false) {
        // 如果已經載入過，直接返回
        if (this.loadedResources.has(path)) {
            return this.loadedResources.get(path);
        }

        // 如果正在載入，返回現有Promise
        if (this.loadingPromises.has(path)) {
            return this.loadingPromises.get(path);
        }

        // 根據文件類型選擇載入方法
        const fileExtension = path.split(".").pop().toLowerCase();
        let loadPromise;

        switch (fileExtension) {
            case "js":
                loadPromise = this.loadScript(path);
                break;
            case "css":
                loadPromise = this.loadStylesheet(path);
                break;
            case "json":
                loadPromise = this.loadJSON(path);
                break;
            case "png":
            case "jpg":
            case "jpeg":
            case "webp":
                loadPromise = this.loadImage(path);
                break;
            default:
                loadPromise = this.loadFile(path);
        }

        // 記錄載入Promise
        this.loadingPromises.set(path, loadPromise);

        try {
            // 等待載入完成
            const resource = await loadPromise;

            // 更新已載入資源映射
            this.loadedResources.set(path, resource);

            // 移除載入Promise記錄
            this.loadingPromises.delete(path);

            // 觸發載入完成事件
            if (!silent) {
                this.events.trigger("resource:loaded", { path, layer });
            }

            return resource;
        } catch (error) {
            // 移除載入Promise記錄
            this.loadingPromises.delete(path);

            // 觸發載入失敗事件
            if (!silent) {
                this.events.trigger("resource:failed", { path, layer, error });
            }

            throw error;
        }
    }

    /**
     * 載入JavaScript腳本
     * @param {string} path - 腳本路徑
     * @returns {Promise} 載入完成的Promise
     */
    loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = path;
            script.async = true;

            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`腳本載入失敗: ${path}`));

            document.head.appendChild(script);
        });
    }

    /**
     * 載入CSS樣式表
     * @param {string} path - 樣式表路徑
     * @returns {Promise} 載入完成的Promise
     */
    loadStylesheet(path) {
        return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = path;

            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`樣式表載入失敗: ${path}`));

            document.head.appendChild(link);
        });
    }

    /**
     * 載入JSON文件
     * @param {string} path - JSON文件路徑
     * @returns {Promise} 載入完成的Promise，解析為JS對象
     */
    async loadJSON(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`JSON載入失敗: ${path} (${response.status})`);
        }
        return response.json();
    }

    /**
     * 載入圖片
     * @param {string} path - 圖片路徑
     * @returns {Promise} 載入完成的Promise，解析為Image對象
     */
    loadImage(path) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = path;

            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`圖片載入失敗: ${path}`));
        });
    }

    /**
     * 載入通用文件
     * @param {string} path - 文件路徑
     * @returns {Promise} 載入完成的Promise，解析為ArrayBuffer
     */
    async loadFile(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`文件載入失敗: ${path} (${response.status})`);
        }
        return response.arrayBuffer();
    }

    /**
     * 釋放資源
     * @param {string} path - 資源路徑
     * @returns {boolean} 是否成功釋放
     */
    releaseResource(path) {
        if (!this.loadedResources.has(path)) {
            return false;
        }

        this.loadedResources.delete(path);
        return true;
    }

    /**
     * 釋放特定層級的所有資源
     * @param {number} layer - 資源層級
     */
    releaseLayerResources(layer) {
        // 由於我們沒有直接儲存資源層級信息，此功能需要額外的映射實現
        // 這裡提供一個簡化版本
        if (layer === this.resourceLayers.ADJACENT_AREAS) {
            // 釋放相鄰區域資源
            for (const areaId in this.resourceMapping.areas) {
                // 跳過當前區域
                if (areaId === this.currentArea) continue;

                const areaResources = this.resourceMapping.areas[areaId];
                areaResources.forEach((resource) => {
                    this.releaseResource(resource.path);
                });
            }
        }
    }
}
