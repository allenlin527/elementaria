/**
 * 本地存儲管理器
 * 負責管理遊戲數據的持久化存儲
 */
export class StorageManager {
    constructor() {
        this.namespace = "elementaria_";
        this.isAvailable = this.checkStorageAvailability();

        // 存儲類別
        this.storageCategories = {
            CORE: "core", // 核心玩家數據
            PROGRESS: "prog", // 遊戲進度
            SETTINGS: "set", // 用戶設置
            CACHE: "cache", // 臨時緩存
            SOCIAL: "soc", // 社交數據
        };
    }

    /**
     * 初始化存儲管理器
     */
    initialize() {
        if (!this.isAvailable) {
            console.warn("本地存儲不可用，遊戲進度將無法保存");
        }

        // 清理過期緩存數據
        this.cleanupExpiredItems();
    }

    /**
     * 檢查存儲可用性
     * @returns {boolean} 存儲是否可用
     */
    checkStorageAvailability() {
        try {
            const testKey = "__storage_test__";
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 設置存儲項目
     * @param {string} key - 項目鍵名
     * @param {*} value - 項目值
     * @param {string} category - 存儲類別
     * @param {number} [expiry] - 過期時間（毫秒），可選
     * @returns {boolean} 是否設置成功
     */
    setItem(key, value, category = this.storageCategories.CORE, expiry = null) {
        if (!this.isAvailable) return false;

        try {
            const fullKey =
                this.namespace + (category ? category + "_" : "") + key;
            const item = {
                value: value,
                timestamp: Date.now(),
            };

            // 如果設置了過期時間，添加到item中
            if (expiry) {
                item.expiry = Date.now() + expiry;
            }

            localStorage.setItem(fullKey, JSON.stringify(item));
            return true;
        } catch (e) {
            console.error("存儲項目設置失敗:", e);

            // 如果是存儲配額錯誤，嘗試清理空間
            if (e.name === "QuotaExceededError" || e.code === 22) {
                this.cleanupStorage();

                // 重試一次
                try {
                    const fullKey =
                        this.namespace + (category ? category + "_" : "") + key;
                    localStorage.setItem(
                        fullKey,
                        JSON.stringify({
                            value: value,
                            timestamp: Date.now(),
                        })
                    );
                    return true;
                } catch (retryError) {
                    console.error("存儲項目設置重試失敗:", retryError);
                    return false;
                }
            }

            return false;
        }
    }

    /**
     * 獲取存儲項目
     * @param {string} key - 項目鍵名
     * @param {string} category - 存儲類別
     * @param {*} defaultValue - 默認值
     * @returns {*} 項目值或默認值
     */
    getItem(key, category = this.storageCategories.CORE, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;

        try {
            const fullKey =
                this.namespace + (category ? category + "_" : "") + key;
            const itemStr = localStorage.getItem(fullKey);

            if (!itemStr) return defaultValue;

            const item = JSON.parse(itemStr);

            // 檢查項目是否過期
            if (item.expiry && item.expiry < Date.now()) {
                localStorage.removeItem(fullKey);
                return defaultValue;
            }

            return item.value;
        } catch (e) {
            console.error("存儲項目獲取失敗:", e);
            return defaultValue;
        }
    }

    /**
     * 移除存儲項目
     * @param {string} key - 項目鍵名
     * @param {string} category - 存儲類別
     * @returns {boolean} 是否移除成功
     */
    removeItem(key, category = this.storageCategories.CORE) {
        if (!this.isAvailable) return false;

        try {
            const fullKey =
                this.namespace + (category ? category + "_" : "") + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error("存儲項目移除失敗:", e);
            return false;
        }
    }

    /**
     * 清理特定類別的存儲項目
     * @param {string} category - 存儲類別
     * @returns {boolean} 是否清理成功
     */
    clearCategory(category) {
        if (!this.isAvailable) return false;

        try {
            const prefix = this.namespace + category + "_";

            // 獲取所有符合前綴的鍵
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }

            // 移除項目
            keysToRemove.forEach((key) => localStorage.removeItem(key));

            return true;
        } catch (e) {
            console.error("類別清理失敗:", e);
            return false;
        }
    }

    /**
     * 清理過期項目
     */
    cleanupExpiredItems() {
        if (!this.isAvailable) return;

        try {
            const now = Date.now();
            const keysToRemove = [];

            // 檢查所有項目
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                // 只處理屬於我們命名空間的項目
                if (!key.startsWith(this.namespace)) continue;

                try {
                    const itemStr = localStorage.getItem(key);
                    if (!itemStr) continue;

                    const item = JSON.parse(itemStr);

                    // 檢查是否過期
                    if (item.expiry && item.expiry < now) {
                        keysToRemove.push(key);
                    }
                } catch (parseError) {
                    // 解析錯誤，可能是已損壞的項目，也將其移除
                    keysToRemove.push(key);
                }
            }

            // 移除過期項目
            keysToRemove.forEach((key) => localStorage.removeItem(key));
        } catch (e) {
            console.error("過期項目清理失敗:", e);
        }
    }

    /**
     * 清理儲存空間
     * 當配額滿時調用，嘗試釋放空間
     */
    cleanupStorage() {
        // 首先清理所有緩存數據
        this.clearCategory(this.storageCategories.CACHE);

        // 檢查並清理超過一個月的過期數據
        const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

        try {
            // 尋找並清理舊數據
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                // 只處理屬於我們命名空間的項目
                if (!key.startsWith(this.namespace)) continue;

                try {
                    const itemStr = localStorage.getItem(key);
                    if (!itemStr) continue;

                    const item = JSON.parse(itemStr);

                    // 檢查時間戳是否太舊
                    if (item.timestamp && item.timestamp < oneMonthAgo) {
                        localStorage.removeItem(key);
                    }
                } catch (parseError) {
                    // 解析錯誤，移除損壞項目
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            console.error("儲存空間清理失敗:", e);
        }
    }
}
