"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Printer, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";
import { useAppConfig } from "@/components/AppConfigContext";

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { appName, appLogo } = useAppConfig();
  const [employee, setEmployee] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/employees/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setEmployee(data.data);
          
          // Generate QR code pointing to verification link
          const verifyUrl = typeof window !== "undefined" 
            ? `${window.location.origin}/admin/employees/${resolvedParams.id}/receipt`
            : `http://localhost:3000/admin/employees/${resolvedParams.id}/receipt`;

          QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 }, (err, url) => {
            if (!err && url) {
              setQrCodeUrl(url);
            }
          });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Receipt Not Found</h2>
          <p className="text-gray-500 text-sm mb-4">The requested employee receipt could not be loaded.</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const verifiedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white p-4 sm:p-8">
      {/* Print Button */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-end print:hidden">
        <button
          className="flex items-center gap-2 bg-[#00894F] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
          onClick={() => window.print()}
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </button>
      </div>

      {/* Printable Receipt Container */}
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-12 border border-gray-200 shadow-xl print:shadow-none print:border-none print:p-0">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#00894F] pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Image 
              src={appLogo} 
              alt="Logo" 
              width={80} 
              height={80} 
              className="object-contain print:w-[70px]"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#00894F] uppercase tracking-wide">{appName}</h1>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-1">Biometric Verification Portal</h2>
              <p className="text-gray-500 text-sm mt-1">Official Employee Verification Receipt</p>
            </div>
          </div>
          <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto gap-4">
            {qrCodeUrl && (
              <div className="flex flex-col items-center p-1.5 bg-slate-50 border border-slate-200 rounded-xl print:bg-transparent">
                <img src={qrCodeUrl} alt="Scan QR Code to Verify" className="w-24 h-24 object-contain" />
                <span className="text-[9px] font-bold text-gray-500 tracking-tight uppercase mt-0.5">Scan to Verify</span>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Receipt ID</p>
              <p className="font-mono font-medium text-gray-800 text-sm">{employee.id.split("-")[0].toUpperCase()}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 mb-1">Date</p>
              <p className="font-medium text-gray-800 text-sm">{verifiedDate}</p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center print:border-2 print:border-black print:bg-transparent">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-green-700 print:text-black" />
            <h3 className="text-xl font-bold text-green-800 print:text-black">VERIFICATION SUCCESSFUL</h3>
          </div>
          <p className="text-green-700 text-sm mt-1 print:text-gray-800">This document certifies that the individual below has been officially verified in the Biometric Database.</p>
        </div>

        {/* Employee Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 mb-16">
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
            <p className="text-base font-medium text-gray-900">{employee.firstName} {employee.middleName} {employee.lastName}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">NIN (National Identity Number)</p>
            <p className="text-base font-medium text-gray-900">{employee.nin || "N/A"}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">Ministry / Department</p>
            <p className="text-base font-medium text-gray-900">{employee.department}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">Position / Designation</p>
            <p className="text-base font-medium text-gray-900">{employee.position}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</p>
            <p className="text-base font-medium text-gray-900">{employee.birthdate ? new Date(employee.birthdate).toLocaleDateString() : "N/A"}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">Employee ID / Service No</p>
            <p className="text-base font-medium text-gray-900">{employee.employmentId || employee.serviceNo || "N/A"}</p>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="mt-16 pt-8">
          <h4 className="text-base font-bold text-gray-800 mb-8 uppercase text-center tracking-widest border-b-2 border-gray-200 pb-4">Required Signatures</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="flex flex-col h-44 border border-gray-200 p-4 rounded-lg bg-gray-50 print:bg-transparent">
              <h5 className="font-bold text-gray-900 text-center mb-4 uppercase text-xs">1. Employee</h5>
              <div className="space-y-3 flex-1 text-xs">
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Name:</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Signature:</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 text-xs">
                <span className="font-semibold text-gray-600">Date:</span>
              </div>
            </div>

            <div className="flex flex-col h-44 border border-gray-200 p-4 rounded-lg bg-gray-50 print:bg-transparent">
              <h5 className="font-bold text-gray-900 text-center mb-4 uppercase text-xs">2. Supervisor / Head of Unit</h5>
              <div className="space-y-3 flex-1 text-xs">
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Name:</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Signature:</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 text-xs">
                <span className="font-semibold text-gray-600">Date:</span>
              </div>
            </div>

            <div className="flex flex-col h-44 border border-gray-200 p-4 rounded-lg bg-gray-50 print:bg-transparent">
              <h5 className="font-bold text-gray-900 text-center mb-4 uppercase text-xs">3. MDA Representative</h5>
              <div className="space-y-3 flex-1 text-xs">
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Name:</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Signature:</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 text-xs">
                <span className="font-semibold text-gray-600">Date:</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-400 print:text-black">
          <p>Generated by {appName}</p>
          <p className="mt-1 font-mono text-[10px]">Document Hash: {employee.id}</p>
        </div>

      </div>
    </div>
  );
}
