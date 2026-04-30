import { describe, it, expect, vi, beforeEach } from "vitest";
import api, { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "./api";

// Mock axios
vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
    },
  };
});

describe("API Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get customers", async () => {
    const mockData = [{ id: 1, name: "Test" }];
    // @ts-ignore
    api.get.mockResolvedValueOnce({ data: mockData });
    
    const data = await getCustomers();
    expect(api.get).toHaveBeenCalledWith("/customers");
    expect(data).toEqual(mockData);
  });

  it("should add a customer", async () => {
    const newCustomer = { name: "Test", phone: "123" };
    // @ts-ignore
    api.post.mockResolvedValueOnce({ data: { success: true, id: 1 } });
    
    // @ts-ignore
    const data = await addCustomer(newCustomer);
    expect(api.post).toHaveBeenCalledWith("/customers", newCustomer);
    expect(data.success).toBe(true);
    expect(data.id).toBe(1);
  });

  it("should update a customer", async () => {
    const updateData = { name: "Test updated" };
    // @ts-ignore
    api.put.mockResolvedValueOnce({ data: { success: true } });
    
    const data = await updateCustomer(1, updateData);
    expect(api.put).toHaveBeenCalledWith("/customers/1", updateData);
    expect(data.success).toBe(true);
  });

  it("should delete a customer", async () => {
    // @ts-ignore
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    
    await deleteCustomer(1);
    expect(api.delete).toHaveBeenCalledWith("/customers/1");
  });
});
