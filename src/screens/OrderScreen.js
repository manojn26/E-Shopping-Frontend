import React, { useContext, useEffect, useReducer } from "react";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import { getError } from "../utils";
import { Helmet } from "react-helmet-async";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "react-bootstrap/Button";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import API_URL from "../API-CALL";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false };

    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    case "DELIVER_RESET":
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };

    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();
  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
    successPay: false,
    loadingPay: false,
  });

  // const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // function createOrder(data, actions) {
  //   return actions.order
  //     .create({
  //       purchase_units: [
  //         {
  //           amount: { value: order.totalPrice },
  //         },
  //       ],
  //     })
  //     .then((orderId) => {
  //       return orderId;
  //     });
  // }
  const id = order._id;
  // const status = "success";
  // const update_time = Date.now();
  // let email_address = userInfo.email;
  const confirmOrder = async () => {
    try {
      dispatch({ type: "PAY_REQUEST" });
      const { data } = await axios.put(
        `${API_URL}/api/orders/${order._id}/pay`,
        id,

        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "PAY_SUCCESS", payload: data });
      toast.success("Order Completed");
    } catch (err) {
      dispatch({ type: "PAY_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };

  // function onApprove(data, actions) {
  //   return actions.order.capture().then(async function (details) {
  //     try {
  //       dispatch({ type: "PAY_REQUEST" });
  //       const { data } = await axios.put(
  //         `/api/orders/${order._id}/pay`,
  //         details,
  //         {
  //           headers: { authorization: `Bearer ${userInfo.token}` },
  //         }
  //       );
  //       dispatch({ type: "PAY_SUCCESS", payload: data });
  //     } catch (err) {
  //       dispatch({ type: "PAY_FAIL", payload: getError(err) });
  //       toast.err(getError(err));
  //     }
  //   });
  // }

  // function onError(err) {
  //   toast.error(getError(err));
  // }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await Axios.get(`${API_URL}/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate("/login");
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
      if (successDeliver) {
        dispatch({ type: "DELIVER_RESET" });
      }
    }
  }, [order, userInfo, orderId, navigate, successPay, successDeliver]);
  // } else {
  //   const loadPaypalScript = async () => {
  //     const { data: clientId } = await axios.get("/api/keys/paypal", {
  //       headers: { authorization: `Bearer ${userInfo.token}` },
  //     });
  //     paypalDispatch({
  //       type: "resetOptions",
  //       value: {
  //         "client-id": clientId,
  //         currency: "USD",
  //       },
  //     });
  //     paypalDispatch({ type: "setLoadingStatus", value: "pending" });
  //   };
  //   loadPaypalScript();
  // }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put(
        `${API_URL}/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("Order is Delivered");
    } catch (error) {
      toast.getError(error);
      dispatch({ type: "DELIVER_FAIL" });
    }
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className='my-3'>Order</h1>
      <Row>
        <Col md={8}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong>
                {order.shippingAddress.fullName}
                <br />
                <strong>Address: </strong>
                {order.shippingAddress.address}
                <br />,{order.shippingAddress.city},
                {order.shippingAddress.postalCode}
                {order.shippingAddress.country}
                &nbsp;
                {order.shippingAddress.location &&
                  order.shippingAddress.location.lat && (
                    <a
                      target='_new'
                      href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                    >
                      Show On Map
                    </a>
                  )}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant='success'>
                  Delivered at {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant='danger'>Not Delivered</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong>
                {order.paymentMethod}
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant='success'>
                  Paid At {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant='danger'>Not Paid</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant='flush'>
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className='align-items-center'>
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='img-fluid rounded img-thumbnail'
                        ></img>
                        {""}
                        <Link to={`/product/${item.slug}`}> {item.name} </Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>Rs. {item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>Rs. {order.itemPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>Rs. {order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>Rs. {order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>
                      <strong>Rs. {order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {/* {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      // <PayPalButtons>
                      //   createOrder={createOrder}
                      //   onApprove={onApprove}
                      //   onError={onError}
                      // </PayPalButtons>
                      <Button onClick={confirmOrder}>Confirm Order</Button>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )} */}
                {!order.isPaid && (
                  <ListGroup.Item>
                    {loadingPay ? (
                      <LoadingBox />
                    ) : (
                      <Button onClick={confirmOrder}>Confirm Order</Button>
                    )}
                  </ListGroup.Item>
                )}

                {/* <ListGroup.Item>
                  <Button onClick={confirmOrder}>Confirm Order</Button>
                </ListGroup.Item> */}

                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver ? (
                      <LoadingBox />
                    ) : (
                      <div className='d-grid'>
                        <Button onClick={deliverOrderHandler}>
                          Deliver Order
                        </Button>
                      </div>
                    )}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
