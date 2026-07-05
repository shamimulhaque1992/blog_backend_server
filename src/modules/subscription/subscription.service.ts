import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

const checkout = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirstOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: {
        userId: user.id,
      },
    });

    return session.url;
  });

  return {
    paymentUrl: transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      console.log(event.data.object);
      const session: Stripe.Checkout.Session = event.data.object;
      const userId = session.metadata?.userId;
      const stripeCustomerId = session.customer as string;
      const stripeSubscriptionId = session.subscription as string;

      if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        throw new Error("Missing metadata in stripe event");
      }

      const stripeSubscription =
        await stripe.subscriptions.retrieve(stripeSubscriptionId);

      const currentPeriodStart =
        stripeSubscription.items.data[0]?.current_period_start!;
      const currentPeriodEndInMilliseconds =
        stripeSubscription.items.data[0]?.current_period_end!;

      const currentPeriodEnd = new Date(currentPeriodEndInMilliseconds * 1000);

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId,
          stripeSubscriptionId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd,
        },
        update: {},
      });

      break;
    case "customer.subscription.updated":
      break;
    case "customer.subscription.deleted":
      break;
    default:
      // Unexpected event type
      console.log(`No event matched. Unhandled event type ${event.type}.`);
      break;
  }
};

export const subscriptionServices = {
  checkout,
  handleWebhook,
};
