import * as types from "../constants/ActionTypes";
import "whatwg-fetch";

function createRegisteredUserStart(newUser) {
  return {
    type: types.CREATE_USER_START,
    payload: newUser
  };
}

export const createRegisteredUser = (newRegisteredUser) => {
  return async (dispatch) => {
    dispatch(createRegisteredUserStart(newRegisteredUser));
    let response = await fetch('api/authenticate');
    const data = await response.json();
    const token = JSON.parse(data.body);
    const { token_type: tType, access_token: aToken } = token;
    const tokenString = `${tType} ${aToken}`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: tokenString },
      body: JSON.stringify(newRegisteredUser)
    };
    response = await fetch("/api/users", options);
    if (response.ok) {
      const newUser = await response.json();
      newUser.created = new Date(newUser.created);
      await dispatch({
        type: types.CREATE_USER_SUCCESS,
        newUser
      });
    } else {
      const error = await response.json();
      alert(`Failed to create registered user: ${error.message}`);
      await dispatch({
        type: types.CREATE_USER_FAIL,
        payload: error,
        error: true
      });
    }
  };
};

export const logoutRegisteredUser = () => {
  return async (dispatch) => {
    await dispatch({
      type: types.USER_LOGOUT_SUCCESS,
    });
  };
};

export const loginRegisteredUser = () => {
  return async (dispatch) => {
    const response = await fetch('api/authenticate');
    const data = await response.json();
    const token = JSON.parse(data.body);
    const { token_type: tType, access_token: aToken } = token;
    const tokenString = `${tType} ${aToken}`;
    await dispatch({
      type: types.USER_LOGIN_SUCCESS,
      auth0Token: tokenString,
    });
  };
};

export const setCurrrentUser = (user) => {
  return (dispatch) => {
    dispatch({
      type: types.SET_CURRENT_USER,
      user
    });
  };
};

export const fetchRegisteredUser = (filter = "", queryCallBack) => {
  return async (dispatch) => {
    let response = await fetch('api/authenticate');
    let data = await response.json();
    const token = JSON.parse(data.body);
    const { token_type: tType, access_token: aToken } = token;
    const tokenString = `${tType} ${aToken}`;
    const options = {
      method: 'GET',
      headers: { authorization: tokenString }
    };
    response = await fetch(`/api/users${filter}`,options);
    if (response.ok) {
      data = await response.json();
      if (data.users && data.users.length === 1) {
        [data] = data.users;
        dispatch({
          type: types.FETCH_USER_SUCCESS,
          registeredUser: data
        });
      }
      queryCallBack();
    } else {
      const error = await response.json();
      dispatch({
        type: types.FETCH_USER_FAIL,
        payload: error,
        error: true
      });
    }
  };
};

export const createGuestUser = (newGuestUser) => {
  return async (dispatch) => {
    let response = await fetch('api/authenticate');
    const data = await response.json();
    const token = JSON.parse(data.body);
    const { token_type: tType, access_token: aToken } = token;
    const tokenString = `${tType} ${aToken}`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: tokenString },
      body: JSON.stringify(newGuestUser)
    };
    response = await fetch("/api/users", options);
    if (response.ok) {
      const updatedUser = await response.json();
      updatedUser.created = new Date(updatedUser.created);
      await dispatch({
        type: types.CREATE_GUEST_USER_SUCCESS,
        newGuest: updatedUser,
        auth0Token: tokenString,
      });
    } else {
      const error = await response.json();
      alert(`Failed to create guest user: ${error.message}`);
      await dispatch(
        {
          type: types.CREATE_GUEST_USER_FAIL,
          payload: error,
          error: true
        }
      );
    }
  };
};

export const logoutGuestUser = (userName) => {
  return async (dispatch) => {
    let response = await fetch('api/authenticate');
    const data = await response.json();
    const token = JSON.parse(data.body);
    const { token_type: tType, access_token: aToken } = token;
    const tokenString = `${tType} ${aToken}`;
    const payload = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", authorization: tokenString },
    };
    response = await fetch(`/api/users/${userName}`, payload);
    if (!response.ok) {
      console.error("Failed to delete user");
    }
    dispatch({
      type: types.USER_LOGOUT_SUCCESS,
    });
  };
};
