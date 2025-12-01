// src/components/admin/PromotionsManagement.jsx
import React, { useState } from "react";
import { FiPlus, FiSend, FiShoppingCart } from "react-icons/fi";

const PromotionsManagement = () => {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "WELCOME10", discount: 10, type: "percentage", used: 45, maxUses: 100, validUntil: "2024-12-31" },
    { id: 2, code: "FREESHIP", discount: 0, type: "shipping", used: 23, maxUses: 50, validUntil: "2024-06-30" }
  ]);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Promotions</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center whitespace-nowrap">
          <FiPlus className="inline mr-2" />
          Create Campaign
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Discount Codes & Coupons</h3>
        <div className="space-y-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-2">
              <div className="flex-1">
                <h4 className="font-semibold">{coupon.code}</h4>
                <p className="text-sm text-gray-600">
                  {coupon.type === 'percentage' ? `${coupon.discount}% off` : 'Free Shipping'} • 
                  Used {coupon.used}/{coupon.maxUses} times • 
                  Valid until {coupon.validUntil}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Email Campaigns</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Weekly Newsletter</h4>
                <p className="text-sm text-gray-600">Sent to 2,345 subscribers</p>
              </div>
              <FiSend className="text-gray-400" />
            </div>
          </button>
          <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Abandoned Cart</h4>
                <p className="text-sm text-gray-600">Automated recovery emails</p>
              </div>
              <FiShoppingCart className="text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionsManagement;