import { RescueListing } from '../models/index.js';

export const decrementRescueStock = async (listingId, quantity) => {
  const listing = await RescueListing.findOneAndUpdate(
    {
      _id: listingId,
      isAvailable: true,
      quantity: { $gte: quantity }
    },
    {
      $inc: { quantity: -quantity }
    },
    { new: true }
  ).populate('restaurant', 'name deliveryFee');

  if (!listing) return null;

  if (listing.quantity === 0) {
    listing.isAvailable = false;
    await listing.save();
  }

  return listing;
};

