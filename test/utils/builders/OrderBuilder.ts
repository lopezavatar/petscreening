/**
 * OrderBuilder — Builder pattern for constructing Order API request payloads.
 *
 * Usage:
 *   const order = new OrderBuilder()
 *     .withProduct('Classic Apple Pie', 2)
 *     .withDeliveryAddress('123 Main St, Springfield')
 *     .withPromoCode('SAVE10')
 *     .build();
 */

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
}

export interface OrderPayload {
  items: OrderItem[];
  deliveryAddress: string;
  promoCode?: string;
  tip?: number;
  notes?: string;
}

export class OrderBuilder {
  private order: OrderPayload = {
    items: [],
    deliveryAddress: '1 Test Lane, Testville',
  };

  withProduct(name: string, quantity = 1, productId = `pid-${name.toLowerCase().replace(/\s/g, '-')}`): this {
    this.order.items.push({ productId, name, quantity });
    return this;
  }

  withDeliveryAddress(address: string): this {
    this.order.deliveryAddress = address;
    return this;
  }

  withPromoCode(code: string): this {
    this.order.promoCode = code;
    return this;
  }

  withTip(amount: number): this {
    this.order.tip = amount;
    return this;
  }

  withNotes(notes: string): this {
    this.order.notes = notes;
    return this;
  }

  build(): OrderPayload {
    if (this.order.items.length === 0) {
      throw new Error('OrderBuilder: at least one product item is required.');
    }
    return { ...this.order, items: [...this.order.items] };
  }
}
