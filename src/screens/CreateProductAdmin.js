import React, { useContext, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { useNavigate } from "react-router-dom";
import { getError } from "../utils";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import API_URL from "../API-CALL";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loadingCreate: true };
    case "CREATE_SUCCESS":
      return {
        ...state,
        loadingCreate: false,
      };
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false, error: action.payload };

    // for image upload
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
};

export default function CreateProductAdmin() {
  const [{ loadingCreate, error, loadingUpload, errorUpload }, dispatch] =
    useReducer(reducer, {
      error: "",
    });

  const [name, setName] = useState("");
  // const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [brand, setBrand] = useState("");
  const [descriptions, setDescriptions] = useState("");

  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);

    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post(`${API_URL}/api/upload`, bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });
      setImage(data.secure_url);
      toast.success("Image Uploaded");
    } catch (error) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(error) });
    }
  };

  const createHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post(
        `${API_URL}/api/products/admin/create`,
        {
          name,
          price,
          image,
          category,
          countInStock,
          brand,
          descriptions,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success("Product Created Succesfull");
      dispatch({ type: "CREATE_SUCCESS" });
      navigate(`/admin/products`);
    } catch (error) {
      toast.error(getError(error));
      dispatch({
        type: "CREATE_FAIL",
      });
    }
  };

  return (
    <Container className='small-container'>
      <Helmet>
        <title>Create Product</title>
      </Helmet>
      <h1>Create Product</h1>
      <Form onSubmit={createHandler}>
        <Form.Group className='mb-3' controlID='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        {/* <Form.Group className='mb-3' controlId='slug'>
          <Form.Label>Slug</Form.Label>
          <Form.Control onChange={(e) => setSlug(e.target.value)} required />
        </Form.Group> */}

        <Form.Group className='mb-3' controlId='price'>
          <Form.Label>Price</Form.Label>
          <Form.Control onChange={(e) => setPrice(e.target.value)} required />
        </Form.Group>

        {/* <Form.Group className='mb-3' controlId='image'>
          <Form.Label>Image</Form.Label>
          <Form.Control
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </Form.Group> */}

        <Form.Group className='mb-3' controlId='productImage'>
          <Form.Label>Select Image</Form.Label>
          <Form.Control type='file' onChange={uploadImageHandler} />
        </Form.Group>
        {/* {loadingUpload && <LoadingBox></LoadingBox>} */}
        {errorUpload && <MessageBox variant='danger'>{errorUpload}</MessageBox>}

        <Form.Group className='mb-3' controlId='category'>
          <Form.Label>Category</Form.Label>
          <Form.Control
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='brand'>
          <Form.Label>Brand</Form.Label>
          <Form.Control onChange={(e) => setBrand(e.target.value)} required />
        </Form.Group>

        <Form.Group className='mb-3' controlId='countInStock'>
          <Form.Label>Count In Stock</Form.Label>
          <Form.Control
            onChange={(e) => setCountInStock(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='descriptions'>
          <Form.Label>Description</Form.Label>
          <Form.Control
            onChange={(e) => setDescriptions(e.target.value)}
            required
          />
        </Form.Group>
        <div className='mb-3'>
          <Button type='submit'>Create</Button>
        </div>
      </Form>
    </Container>
  );
}
