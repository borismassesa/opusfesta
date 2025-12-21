import { API_ENDPOINTS } from '@/constants';
import { auth } from '@/utils';

interface GraphQLRequest {
  query: string;
  variables?: any;
  operationName?: string;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_ENDPOINTS.GRAPHQL;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await auth.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = any>(request: GraphQLRequest): Promise<T> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data) {
        throw new Error('No data returned from server');
      }

      return result.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Query methods
  async query<T = any>(query: string, variables?: any): Promise<T> {
    return this.request<T>({ query, variables });
  }

  // Mutation methods
  async mutate<T = any>(mutation: string, variables?: any): Promise<T> {
    return this.request<T>({ query: mutation, variables });
  }

  // Subscription methods (placeholder - would use WebSocket in production)
  async subscribe<T = any>(subscription: string, variables?: any): Promise<AsyncIterable<T>> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, return an empty async iterator
    return {
      async *[Symbol.asyncIterator]() {
        // Placeholder implementation
      },
    };
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Convenience functions
export const query = <T = any>(query: string, variables?: any) =>
  apiClient.query<T>(query, variables);

export const mutate = <T = any>(mutation: string, variables?: any) =>
  apiClient.mutate<T>(mutation, variables);

export const subscribe = <T = any>(subscription: string, variables?: any) =>
  apiClient.subscribe<T>(subscription, variables);

// GraphQL queries and mutations
export const QUERIES = {
  // User queries
  ME: `
    query Me {
      me {
        id
        phone
        email
        role
        accountId
        createdAt
        updatedAt
      }
    }
  `,

  // Vendor queries
  VENDORS: `
    query Vendors($input: VendorSearchInput) {
      vendors(input: $input) {
        data {
          id
          name
          category
          city
          phone
          email
          description
          ratingAvg
          ratingCount
          kycStatus
          isVerified
          isActive
          createdAt
          updatedAt
        }
        pagination {
          page
          limit
          total
          totalPages
          hasNext
          hasPrev
        }
      }
    }
  `,

  VENDOR: `
    query Vendor($id: ID!) {
      vendor(id: $id) {
        id
        name
        category
        city
        phone
        email
        description
        ratingAvg
        ratingCount
        kycStatus
        isVerified
        isActive
        createdAt
        updatedAt
        user {
          id
          phone
          email
          role
        }
        bookings {
          id
          status
          quoteTotal
          depositDue
          createdAt
        }
        reviews {
          id
          rating
          comment
          createdAt
          user {
            id
            phone
          }
        }
      }
    }
  `,

  VENDOR_CATEGORIES: `
    query VendorCategories {
      vendorCategories {
        id
        name
        slug
        description
        isActive
      }
    }
  `,

  // Event queries
  EVENTS: `
    query Events($page: Int, $limit: Int) {
      events(page: $page, limit: $limit) {
        data {
          id
          name
          type
          date
          budgetTotal
          guestCount
          location
          description
          isActive
          createdAt
          updatedAt
          owner {
            id
            phone
            email
          }
          bookings {
            id
            status
            quoteTotal
            depositDue
            createdAt
          }
          guests {
            id
            name
            rsvp
            createdAt
          }
        }
        pagination {
          page
          limit
          total
          totalPages
          hasNext
          hasPrev
        }
      }
    }
  `,

  EVENT: `
    query Event($id: ID!) {
      event(id: $id) {
        id
        name
        type
        date
        budgetTotal
        guestCount
        location
        description
        isActive
        createdAt
        updatedAt
        owner {
          id
          phone
          email
          role
        }
        bookings {
          id
          status
          quoteTotal
          depositDue
          notes
          createdAt
          updatedAt
          vendor {
            id
            name
            category
            city
            ratingAvg
            ratingCount
          }
          invoices {
            id
            type
            amount
            status
            createdAt
          }
        }
        guests {
          id
          name
          phone
          email
          rsvp
          dietary
          qrCode
          isPlusOne
          createdAt
          updatedAt
        }
      }
    }
  `,

  MY_EVENTS: `
    query MyEvents {
      myEvents {
        id
        name
        type
        date
        budgetTotal
        guestCount
        location
        description
        isActive
        createdAt
        updatedAt
        bookings {
          id
          status
          quoteTotal
          depositDue
          createdAt
          vendor {
            id
            name
            category
            city
            ratingAvg
          }
        }
        guests {
          id
          name
          rsvp
          createdAt
        }
      }
    }
  `,

  // Guest queries
  GUESTS: `
    query Guests($eventId: String!) {
      guests(eventId: $eventId) {
        id
        name
        phone
        email
        rsvp
        dietary
        qrCode
        isPlusOne
        createdAt
        updatedAt
      }
    }
  `,

  // Booking queries
  BOOKINGS: `
    query Bookings($eventId: String, $vendorId: String, $page: Int, $limit: Int) {
      bookings(eventId: $eventId, vendorId: $vendorId, page: $page, limit: $limit) {
        data {
          id
          status
          quoteTotal
          depositDue
          notes
          createdAt
          updatedAt
          event {
            id
            name
            type
            date
            location
          }
          vendor {
            id
            name
            category
            city
            ratingAvg
            ratingCount
          }
          invoices {
            id
            type
            amount
            status
            createdAt
          }
        }
        pagination {
          page
          limit
          total
          totalPages
          hasNext
          hasPrev
        }
      }
    }
  `,

  // Template queries
  EVENT_TEMPLATES: `
    query EventTemplates($type: String) {
      eventTemplates(type: $type) {
        id
        name
        type
        description
        checklist
        budgetItems
        isActive
        createdAt
        updatedAt
      }
    }
  `,
};

export const MUTATIONS = {
  // Event mutations
  CREATE_EVENT: `
    mutation CreateEvent($input: CreateEventInput!) {
      createEvent(input: $input) {
        id
        name
        type
        date
        budgetTotal
        guestCount
        location
        description
        isActive
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_EVENT: `
    mutation UpdateEvent($input: UpdateEventInput!) {
      updateEvent(input: $input) {
        id
        name
        type
        date
        budgetTotal
        guestCount
        location
        description
        isActive
        createdAt
        updatedAt
      }
    }
  `,

  DELETE_EVENT: `
    mutation DeleteEvent($id: ID!) {
      deleteEvent(id: $id)
    }
  `,

  // Vendor mutations
  CREATE_VENDOR: `
    mutation CreateVendor($input: CreateVendorInput!) {
      createVendor(input: $input) {
        id
        name
        category
        city
        phone
        email
        description
        ratingAvg
        ratingCount
        kycStatus
        isVerified
        isActive
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_VENDOR: `
    mutation UpdateVendor($input: UpdateVendorInput!) {
      updateVendor(input: $input) {
        id
        name
        category
        city
        phone
        email
        description
        ratingAvg
        ratingCount
        kycStatus
        isVerified
        isActive
        createdAt
        updatedAt
      }
    }
  `,

  // Booking mutations
  CREATE_BOOKING: `
    mutation CreateBooking($input: CreateBookingInput!) {
      createBooking(input: $input) {
        id
        status
        quoteTotal
        depositDue
        notes
        createdAt
        updatedAt
        event {
          id
          name
          type
          date
        }
        vendor {
          id
          name
          category
          city
        }
      }
    }
  `,

  UPDATE_BOOKING: `
    mutation UpdateBooking($input: UpdateBookingInput!) {
      updateBooking(input: $input) {
        id
        status
        quoteTotal
        depositDue
        notes
        createdAt
        updatedAt
      }
    }
  `,

  // Guest mutations
  CREATE_GUEST: `
    mutation CreateGuest($input: CreateGuestInput!) {
      createGuest(input: $input) {
        id
        name
        phone
        email
        rsvp
        dietary
        qrCode
        isPlusOne
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_GUEST: `
    mutation UpdateGuest($input: UpdateGuestInput!) {
      updateGuest(input: $input) {
        id
        name
        phone
        email
        rsvp
        dietary
        qrCode
        isPlusOne
        createdAt
        updatedAt
      }
    }
  `,

  DELETE_GUEST: `
    mutation DeleteGuest($id: ID!) {
      deleteGuest(id: $id)
    }
  `,

  // Invoice mutations
  CREATE_INVOICE: `
    mutation CreateInvoice($input: CreateInvoiceInput!) {
      createInvoice(input: $input) {
        id
        type
        amount
        dueDate
        status
        createdAt
        updatedAt
      }
    }
  `,

  // Payment mutations
  CREATE_PAYMENT_INTENT: `
    mutation CreatePaymentIntent($invoiceId: ID!, $method: PaymentMethod!) {
      createPaymentIntent(invoiceId: $invoiceId, method: $method) {
        id
        invoiceId
        amount
        method
        providerRef
        checkoutUrl
        expiresAt
      }
    }
  `,

  ACKNOWLEDGE_PAYMENT: `
    mutation AcknowledgePayment($providerRef: String!) {
      acknowledgePayment(providerRef: $providerRef) {
        id
        amount
        method
        providerRef
        status
        createdAt
        updatedAt
      }
    }
  `,

  // Review mutations
  CREATE_REVIEW: `
    mutation CreateReview($bookingId: ID!, $rating: Int!, $comment: String) {
      createReview(bookingId: $bookingId, rating: $rating, comment: $comment) {
        id
        rating
        comment
        createdAt
        booking {
          id
          vendor {
            id
            name
          }
        }
        user {
          id
          phone
        }
      }
    }
  `,
};

export const SUBSCRIPTIONS = {
  // Real-time subscriptions
  MESSAGE_ADDED: `
    subscription MessageAdded($threadId: ID!) {
      messageAdded(threadId: $threadId) {
        id
        threadId
        senderId
        text
        attachments
        createdAt
        updatedAt
      }
    }
  `,

  RSVP_UPDATED: `
    subscription RsvpUpdated($eventId: ID!) {
      rsvpUpdated(eventId: $eventId) {
        id
        name
        rsvp
        updatedAt
      }
    }
  `,

  BOOKING_UPDATED: `
    subscription BookingUpdated($bookingId: ID!) {
      bookingUpdated(bookingId: $bookingId) {
        id
        status
        quoteTotal
        depositDue
        updatedAt
      }
    }
  `,

  NOTIFICATION_ADDED: `
    subscription NotificationAdded($userId: ID!) {
      notificationAdded(userId: $userId) {
        id
        type
        title
        message
        data
        read
        createdAt
      }
    }
  `,
};
