import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import API_URL from "../API-CALL";

function Product(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    // send ajax request to backend
    const { data } = await axios.get(`${API_URL}/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert("Sorry! Products Are Out Of Stock");
      return;
    }
    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...item, quantity },
    });
  };

  return (
    <Card>
      {/* here we use Link instead of <a> for not refreshing the page */}
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className='card-img-top' alt={product.name} />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>
          <strong>Rs. </strong>
          {product.price}
        </Card.Text>
        {/* here disable button does not work */}
        {product.countInStock === 0 ? (
          <Button disabled> Out Of Stock</Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add To Cart</Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default Product;
