/**
 * UserBuilder — Builder pattern for constructing User test data objects.
 *
 * Provides a fluent API for building valid (or intentionally invalid) user
 * payloads used in API tests and UI form steps.
 *
 * AAA note: Builders belong to the *Arrange* layer.
 *
 * Usage:
 *   const user = new UserBuilder()
 *     .withName('Alice')
 *     .withEmail('alice@example.com')
 *     .withRole('admin')
 *     .build();
 */

export interface User {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'guest';
  address?: string;
  phone?: string;
}

export class UserBuilder {
  private user: User = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'P@ssw0rd!',
    role: 'customer',
  };

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  withRole(role: User['role']): this {
    this.user.role = role;
    return this;
  }

  withAddress(address: string): this {
    this.user.address = address;
    return this;
  }

  withPhone(phone: string): this {
    this.user.phone = phone;
    return this;
  }

  /**
   * Produce a unique email to avoid collision between parallel test runs.
   */
  withUniqueEmail(prefix = 'user'): this {
    this.user.email = `${prefix}-${Date.now()}@test.example.com`;
    return this;
  }

  build(): User {
    // Defensive clone — prevent mutation after build()
    return { ...this.user };
  }
}
