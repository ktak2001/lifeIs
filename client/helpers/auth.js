import cookie from "js-cookie"
import Router from "next/router"
import axios from "axios"
import { API } from "../config";

export const setCookie = (key, value) => {
	if (typeof window !== "undefined") {
		cookie.set(key, value, {
			expires: 7
		});
	}
};

export const removeCookie = key => {
	if (typeof window !== "undefined") {
		cookie.remove(key);
	}
}

export const getCookie = (key, req) => {
	return typeof window !== "undefined" ? getCookieFromBrowser(key) : getCookieFromServer(key, req);
}

export const getCookieFromBrowser = key => {
	console.log("getCookieBrowser:", key)
	return cookie.get(key);
}

export const getCookieFromServer = (key, req) => {
	console.log("req.headers.cookie", req.headers.cookie)
	if (!req.headers.cookie) {
		return undefined;
	}
	// console.log('req.headers.cookie', req.headers.cookie);
	let token = req.headers.cookie.split(';').find(c => c.trim().startsWith(`${key}=`));
	if (!token) {
		return undefined;
	}
	let tokenValue = token.split('=')[1];// key = value (value == [1])
	// console.log('getCookieFromServer', tokenValue);
	return tokenValue;
}

export const setLocalStorage = (key, value) => {
	if (typeof window !== "undefined") {
		localStorage.setItem(key, JSON.stringify(value))
	}
}

export const getLocalStorage = (key) => {
	if (typeof window !== "undefined") {
		return localStorage.getItem(key)
	}
}

export const removeLocalStorage = key => {
	if (typeof window !== "undefined") {
		localStorage.removeItem(key);
	}
};

// authenticate user by passing data to cookie and localstorage during signin
export const authenticate = (response, next) => {
	setCookie('token', response.data.token);
	setLocalStorage('user', response.data.user);
	next();
};

// access user info from localstorage
export async function isAuth(token) {
	let isAdmin = false
	if (token === undefined) {
		console.log('inside undefined token')
		return {
			user: null,
			isAdmin
		}
	}
	try {
		const {data: {user}} = await axios.get(`${API}/auth`, {
			headers: {
				authorization: `Bearer ${token}`,
				contentType: 'application/json'
			}
		})
		if (user !== null) {
			isAdmin = user.role === "admin"
		}
		console.log('user, isAdmin', user, isAdmin)
		return {
			user,
			isAdmin
		}
	} catch(err) {
		throw new Error('error in isAuth')
	}
};

export const logout = () => {
	removeCookie('token');
	removeLocalStorage('user');
};
