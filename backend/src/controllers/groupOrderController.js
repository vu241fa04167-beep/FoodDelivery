import { GroupOrder, Restaurant, Food, Order } from '../models/index.js';
import { generateGroupCode } from '../utils/codeGenerator.js';

export const createGroup = async (req, res, next) => {
  try {
    const { restaurantId } = req.body;
    const r = await Restaurant.findOne({ _id: restaurantId, approved: true });
    if (!r) return res.status(404).json({ message: 'Restaurant not found or not approved' });

    let code;
    let attempts = 0;
    while (!code && attempts < 10) {
      const candidate = generateGroupCode();
      const existing = await GroupOrder.findOne({ code: candidate });
      if (!existing) code = candidate;
      attempts++;
    }

    const group = await GroupOrder.create({
      code,
      creator: req.user._id,
      restaurant: r._id,
      members: [{ user: req.user._id, name: req.user.name, joinedAt: new Date() }],
      items: []
    });

    const populated = await GroupOrder.findById(group._id)
      .populate('restaurant', 'name image coverImage deliveryTime deliveryFee address')
      .populate('creator', 'name email');

    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
};

export const joinGroup = async (req, res, next) => {
  try {
    const code = String(req.body.code || req.params.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Invitation code is required' });

    const group = await GroupOrder.findOne({ code, status: 'open' })
      .populate('restaurant', 'name image coverImage deliveryTime deliveryFee')
      .populate('creator', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group order not found or already closed' });
    }

    const alreadyMember = group.members.some(m => m.user && m.user.equals(req.user._id));
    if (!alreadyMember) {
      group.members.push({
        user: req.user._id,
        name: req.user.name,
        joinedAt: new Date()
      });
      await group.save();
    }

    res.json(group);
  } catch (e) {
    next(e);
  }
};

export const getGroup = async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const group = await GroupOrder.findOne({ code })
      .populate('restaurant', 'name image coverImage deliveryTime deliveryFee address')
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .populate('items.food', 'name price image isAvailable')
      .populate('items.addedBy', 'name');

    if (!group) return res.status(404).json({ message: 'Group order not found' });

    const memberBreakdown = {};
    group.members.forEach(m => {
      const uId = (m.user?._id || m.user).toString();
      memberBreakdown[uId] = {
        userId: uId,
        name: m.name,
        items: [],
        subtotal: 0
      };
    });

    let groupSubtotal = 0;
    group.items.forEach(item => {
      const addedById = (item.addedBy?._id || item.addedBy || '').toString();
      const itemCost = item.price * item.quantity;
      groupSubtotal += itemCost;

      if (memberBreakdown[addedById]) {
        memberBreakdown[addedById].items.push(item);
        memberBreakdown[addedById].subtotal += itemCost;
      } else {
        memberBreakdown[addedById] = {
          userId: addedById,
          name: item.addedByName || 'Guest',
          items: [item],
          subtotal: itemCost
        };
      }
    });

    const deliveryFee = group.restaurant?.deliveryFee || 2.5;
    const groupTotal = Number((groupSubtotal + deliveryFee).toFixed(2));

    const responseData = group.toObject();
    responseData.memberBreakdown = Object.values(memberBreakdown);
    responseData.groupSubtotal = Number(groupSubtotal.toFixed(2));
    responseData.deliveryFee = deliveryFee;
    responseData.groupTotal = groupTotal;

    res.json(responseData);
  } catch (e) {
    next(e);
  }
};

export const addGroupItem = async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const { foodId, quantity = 1, notes = '' } = req.body;

    const group = await GroupOrder.findOne({ code, status: 'open' });
    if (!group) return res.status(404).json({ message: 'Group order not found or already closed' });

    const isMember = group.members.some(m => m.user && m.user.equals(req.user._id));
    if (!isMember) {
      group.members.push({ user: req.user._id, name: req.user.name, joinedAt: new Date() });
    }

    const food = await Food.findOne({ _id: foodId, restaurant: group.restaurant, isAvailable: true });
    if (!food) return res.status(404).json({ message: 'Menu item not found or unavailable' });

    const q = Math.min(20, Math.max(1, Number(quantity) || 1));

    const existingIndex = group.items.findIndex(
      i => i.food.equals(foodId) && i.addedBy.equals(req.user._id)
    );

    if (existingIndex > -1) {
      group.items[existingIndex].quantity += q;
      if (notes) group.items[existingIndex].notes = notes;
    } else {
      group.items.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: q,
        addedBy: req.user._id,
        addedByName: req.user.name,
        notes: notes || ''
      });
    }

    await group.save();

    const updated = await GroupOrder.findById(group._id)
      .populate('restaurant', 'name image deliveryTime deliveryFee')
      .populate('items.food', 'name price image isAvailable')
      .populate('items.addedBy', 'name');

    res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const removeGroupItem = async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const itemId = req.params.itemId;

    const group = await GroupOrder.findOne({ code, status: 'open' });
    if (!group) return res.status(404).json({ message: 'Group order not found' });

    const item = group.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in group order' });

    const isCreator = group.creator.equals(req.user._id);
    const isOwner = item.addedBy.equals(req.user._id);

    if (!isCreator && !isOwner) {
      return res.status(403).json({ message: 'You can only remove items you added' });
    }

    group.items.pull(itemId);
    await group.save();

    res.json({ message: 'Item removed', group });
  } catch (e) {
    next(e);
  }
};

export const checkoutGroup = async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const group = await GroupOrder.findOne({ code, status: 'open' }).populate('items.food');

    if (!group) return res.status(404).json({ message: 'Group order not found or already closed' });

    if (!group.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the group order creator can finalize checkout' });
    }

    const { address, paymentMethod = 'cod', deliveryInstructions } = req.body;
    if (!address?.line1 || !address?.city) {
      return res.status(400).json({ message: 'A delivery address is required for checkout' });
    }
    if (!group.items.length) {
      return res.status(400).json({ message: 'No items in group order to checkout' });
    }

    if (group.items.some(i => !i.food?.isAvailable)) {
      return res.status(409).json({ message: 'One or more items in the group cart are no longer available' });
    }

    const r = await Restaurant.findById(group.restaurant);
    const items = group.items.map(i => ({
      food: i.food._id,
      name: i.food.name,
      price: i.food.price,
      quantity: i.quantity,
      notes: i.notes ? `[${i.addedByName}]: ${i.notes}` : `[${i.addedByName}]`
    }));

    const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
    const deliveryFee = r?.deliveryFee || 2.5;
    const total = Number((subtotal + deliveryFee).toFixed(2));

    const order = await Order.create({
      customer: group.creator,
      restaurant: group.restaurant,
      items,
      deliveryAddress: address,
      deliveryInstructions: deliveryInstructions || `Group Order (${group.code}) - ${group.members.length} members`,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      status: 'placed',
      subtotal,
      deliveryFee,
      total,
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        note: `Group order ${group.code} placed by ${req.user.name}`
      }]
    });

    group.status = 'checked_out';
    group.associatedOrder = order._id;
    await group.save();

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
};
