import React, { useState, useEffect, useCallback } from "react";
import "./index.css";

interface PasswordProtectProps {
  /** 访问密码 */
  password: string;
  /** 子内容 */
  children: React.ReactNode;
  /** 标题，可选 */
  title?: string;
  /** 提示文字，可选 */
  tip?: string;
}

/**
 * 文档密码保护组件
 * @description 用于对敏感文档进行简单的密码访问保护
 * @param props - 组件属性
 * @returns 受控的内容渲染组件
 */
const PasswordProtect: React.FC<PasswordProtectProps> = ({
  password,
  children,
  title = "本文档已加密",
  tip = "请输入访问密码以查看内容",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /**
   * 根据文档路径生成唯一的存储键名
   * @returns 本地存储键名
   */
  const getStorageKey = useCallback(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    return `doc_password_unlock_${btoa(path)}`;
  }, []);

  // 组件挂载时检查本地存储是否已有解锁记录
  useEffect(() => {
    try {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved === "true") {
        setIsUnlocked(true);
      }
    } catch (e) {
      // 存储访问失败时忽略，正常走密码验证流程
    }
  }, [getStorageKey]);

  /**
   * 处理密码输入变化
   * @param e - 输入框变更事件
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (errorMsg) {
      setErrorMsg("");
    }
  };

  /**
   * 处理密码提交验证
   * @param e - 表单提交事件
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue === password) {
      setIsUnlocked(true);
      setErrorMsg("");
      try {
        localStorage.setItem(getStorageKey(), "true");
      } catch (e) {
        // 存储失败忽略
      }
    } else {
      setErrorMsg("密码错误，请重试");
    }
  };

  /**
   * 处理回车键快捷提交
   * @param e - 键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // 已解锁，直接渲染内容
  if (isUnlocked) {
    return <div className="passwordContent">{children}</div>;
  }

  // 未解锁，渲染密码输入界面
  return (
    <div className="passwordWrapper">
      <div className="passwordCard">
        <div className="lockIcon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 className="passwordTitle">{title}</h2>
        <p className="passwordTip">{tip}</p>
        <form className="passwordForm" onSubmit={handleSubmit}>
          <div className="inputWrapper">
            <input
              type="password"
              className={`passwordInput ${errorMsg ? "error" : ""}`}
              placeholder="请输入密码"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          {errorMsg && <div className="errorMessage">{errorMsg}</div>}
          <button type="submit" className="submitButton">
            确认访问
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtect;
