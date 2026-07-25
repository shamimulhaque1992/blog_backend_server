import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

const getPeriodEnd = (payload: Stripe.Subscription) => {
  const currentPeriodEndInMilliseconds =
    payload.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndInMilliseconds * 1000);
  return currentPeriodEnd;
};

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    throw new Error("Missing metadata in stripe event");
  }

  const stripeSubscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const currentPeriodEnd = getPeriodEnd(stripeSubscription);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
    },
  });
};

export const handleChangeSubscription = async (
  payload: Stripe.Subscription,
) => {
  const stripeSubscriptionId = payload.id;

  const status =
    payload.status === "active" || payload.status === "trialing"
      ? SubscriptionStatus.ACTIVE
      : payload.status === "canceled"
        ? SubscriptionStatus.CANCELED
        : SubscriptionStatus.EXPIRED;

  const currentPeriodEnd = getPeriodEnd(payload);

  const isSubscriptionExists = prisma.subscription.findUniqueOrThrow({
    where: { stripeSubscriptionId },
  });

  if (!isSubscriptionExists) {
    console.log(
      `subscription not found for the subscription id ${stripeSubscriptionId}`,
    );
    return;
  }

  await prisma.subscription.update({
    where:{stripeSubscriptionId},
    data:{status, currentPeriodEnd}
  })
};


export const getSubscriptionStatus = async()=>{
  
}