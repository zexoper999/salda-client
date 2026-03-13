import axios from "axios";

// axios 인스턴스 생성
export const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true, // 백엔드에서 구워준 JWT 쿠키를 항상 같이 보내라는 뜻
});
