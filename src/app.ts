import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import { userRouter } from "./modules/user/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { postsRoute } from "./modules/posts/posts.route";
import { commentRoute } from "./modules/comments/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globaErrorHandler";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";
import { stripe } from "./lib/stripe";

const endpointSecret = config.stripe_webhook_secret;

const app: Application = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// app.post(
//   "/api/subscription/webhook",
//   express.raw({ type: "application/json" }),
//   (req: Request, res: Response) => {
//     let event = req.body;
//     console.log(event, "event");
//     console.log(req.headers, "headers");
//     // Only verify the event if you have an endpoint secret defined.
//     // Otherwise use the basic event deserialized with JSON.parse
//     if (endpointSecret) {
//       // Get the signature sent by Stripe
//       const signature = req.headers["stripe-signature"]!;
//       try {
//         event = stripe.webhooks.constructEvent(
//           req.body,
//           signature,
//           endpointSecret,
//         );
//       } catch (err: any) {
//         console.log(`⚠️  Webhook signature verification failed.`, err.message);
//         return res.status(400).json({
//           message: err.message,
//         });
//       }
//     }
//     console.log(event, "event after try");
//     // Handle the event
//     switch (event.type) {
//       case "checkout.session.completed":
//         const paymentIntent = event.data.object;
//         console.log("🚀 ~ paymentIntent:", paymentIntent);
//         console.log(
//           `PaymentIntent for ${paymentIntent.amount} was successful!`,
//         );
//         // Then define and call a method to handle the successful payment intent.
//         // handlePaymentIntentSucceeded(paymentIntent);
//         break;
//       case "payment_method.attached":
//         const paymentMethod = event.data.object;
//         // Then define and call a method to handle the successful attachment of a PaymentMethod.
//         // handlePaymentMethodAttached(paymentMethod);
//         break;
//       default:
//         // Unexpected event type
//         console.log(`Unhandled event type ${event.type}.`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     res.send();
//   },
// );

app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.get("/", async (req: Request, res: Response) => {
  res.send({ message: "server is running" });
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use("/api/posts", postsRoute);
app.use("/api/comments", commentRoute);
app.use("/api/subscription", subscriptionRoutes);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
