import React, { useContext, useReducer, useState } from "react";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { getError } from "../utils";
import axios from "axios";
import API_URL from "../API-CALL";

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sellerName, setSellerName] = useState(userInfo.seller.name);
  const [sellerLogo, setSetterLogo] = useState(userInfo.seller.logo);
  const [sellerDescription, setSellerDescription] = useState(
    userInfo.seller.description
  );

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords Doesnt Match");
      return;
    }
    try {
      const { data } = await axios.put(
        `${API_URL}/api/users/profile`,
        {
          name,
          email,
          password,
          sellerName,
          sellerLogo,
          sellerDescription,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: "UPDATE_SUCCESS",
      });
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("User Updated Succesfully");
    } catch (error) {
      dispatch({
        type: "FETCH_FAIL",
      });
      toast.error(getError(error));
    }
  };

  return (
    <div className='container small-conatiner'>
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className='my-3'>User Profile</h1>
      <form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='name'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='password'>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type='password'
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        {/* seller data getting */}
        {userInfo.isSeller && (
          <>
            <h2>Seller</h2>
            <Form.Group className='mb-3' controlId='sellerName'>
              <Form.Label>Seller Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Seller Name'
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='sellerLogo'>
              <Form.Label>Seller Logo</Form.Label>
              <Form.Control
                type='text'
                value={sellerLogo}
                onChange={(e) => setSetterLogo(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='sellerDescription'>
              <Form.Label>Seller Description</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Seller Description'
                value={sellerDescription}
                onChange={(e) => setSellerDescription(e.target.value)}
              />
            </Form.Group>
          </>
        )}

        <div className='mb-3'>
          <Button type='submit'>Update</Button>
        </div>
      </form>
    </div>
  );
}
