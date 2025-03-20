/**
 * 事件系統
 * 負責遊戲內各模組間的通信
 */
export class EventSystem {
    constructor() {
        this.listeners = {};
        this.listenerCount = 0;
    }

    /**
     * 註冊事件監聽器
     * @param {string} eventType - 事件類型
     * @param {Function} callback - 回調函數
     * @returns {Object} 訂閱標識，用於取消訂閱
     */
    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }

        const listenerId = this.listenerCount++;
        this.listeners[eventType].push({
            id: listenerId,
            callback,
        });

        // 返回訂閱標識
        return {
            type: eventType,
            id: listenerId,
        };
    }

    /**
     * 移除事件監聽器
     * @param {Object} subscription - 訂閱標識
     * @returns {boolean} 是否成功移除
     */
    off(subscription) {
        if (!subscription || !this.listeners[subscription.type]) {
            return false;
        }

        const index = this.listeners[subscription.type].findIndex(
            (listener) => listener.id === subscription.id
        );

        if (index !== -1) {
            this.listeners[subscription.type].splice(index, 1);
            return true;
        }

        return false;
    }

    /**
     * 觸發事件
     * @param {string} eventType - 事件類型
     * @param {*} data - 事件數據
     * @returns {boolean} 是否有監聽器接收到事件
     */
    trigger(eventType, data) {
        if (
            !this.listeners[eventType] ||
            this.listeners[eventType].length === 0
        ) {
            return false;
        }

        // 複製監聽器列表，防止回調中修改列表
        const listeners = [...this.listeners[eventType]];

        listeners.forEach((listener) => {
            try {
                listener.callback(data);
            } catch (error) {
                console.error(`事件處理錯誤(${eventType}):`, error);
            }
        });

        return true;
    }

    /**
     * 一次性事件監聽
     * @param {string} eventType - 事件類型
     * @param {Function} callback - 回調函數
     * @returns {Object} 訂閱標識
     */
    once(eventType, callback) {
        const subscription = this.on(eventType, (data) => {
            callback(data);
            this.off(subscription);
        });

        return subscription;
    }

    /**
     * 清理所有事件監聽器
     */
    clear() {
        this.listeners = {};
    }
}
