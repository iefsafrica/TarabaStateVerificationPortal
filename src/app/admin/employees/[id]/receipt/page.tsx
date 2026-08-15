import prisma from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const employee = await prisma.employee.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!employee) {
    notFound();
  }

  // Format date correctly
  const verifiedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white p-8">
      {/* Print Button (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-end print:hidden">
        <button 
          className="flex items-center gap-2 bg-[#00894F] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
          onClick={() => {
            // Need a client component for window.print() but since this is a Server Component,
            // we'll just use a tiny inline script tag to handle the click.
          }}
          // @ts-ignore
          onClickCapture="window.print()"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </button>
      </div>

      {/* Printable Receipt Container */}
      <div className="max-w-4xl mx-auto bg-white p-12 border border-gray-200 shadow-xl print:shadow-none print:border-none print:p-0">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b-2 border-[#00894F] pb-6 mb-8">
          <div className="flex items-center gap-6">
            <Image 
              src="/images/tsu-logo.png" 
              alt="Taraba State Seal" 
              width={100} 
              height={100} 
              className="object-contain print:w-[80px]"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#00894F] uppercase tracking-wide">Taraba State Government</h1>
              <h2 className="text-xl font-semibold text-gray-800 mt-1">Biometric Verification Portal</h2>
              <p className="text-gray-500 mt-1">Official Employee Verification Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Receipt ID</p>
            <p className="font-mono font-medium text-gray-800">{employee.id.split("-")[0].toUpperCase()}</p>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">Date</p>
            <p className="font-medium text-gray-800">{verifiedDate}</p>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center print:border-2 print:border-black print:bg-transparent">
          <h3 className="text-xl font-bold text-green-800 print:text-black">VERIFICATION SUCCESSFUL</h3>
          <p className="text-green-700 mt-2 print:text-gray-800">This document certifies that the individual below has been officially verified in the Taraba State Biometric Database.</p>
        </div>

        {/* Employee Details Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-16">
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-sm text-gray-500 uppercase font-semibold">Full Name</p>
            <p className="text-lg font-medium text-gray-900">{employee.firstName} {employee.middleName} {employee.lastName}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-sm text-gray-500 uppercase font-semibold">NIN (National Identity Number)</p>
            <p className="text-lg font-medium text-gray-900">{employee.nin || "N/A"}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-sm text-gray-500 uppercase font-semibold">Ministry / Department</p>
            <p className="text-lg font-medium text-gray-900">{employee.department}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-sm text-gray-500 uppercase font-semibold">Position / Designation</p>
            <p className="text-lg font-medium text-gray-900">{employee.position}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-sm text-gray-500 uppercase font-semibold">Date of Birth</p>
            <p className="text-lg font-medium text-gray-900">{employee.birthdate ? new Date(employee.birthdate).toLocaleDateString() : "N/A"}</p>
          </div>
          <div className="space-y-1 border-b border-gray-100 print:border-gray-300 pb-3">
            <p className="text-sm text-gray-500 uppercase font-semibold">Employee ID / Service No</p>
            <p className="text-lg font-medium text-gray-900">{employee.employmentId || employee.serviceNo || "N/A"}</p>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="mt-20 pt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-12 uppercase text-center tracking-widest border-b-2 border-gray-200 pb-4">Required Signatures</h4>
          
          <div className="grid grid-cols-3 gap-8 text-sm">
            
            {/* 1. Employee */}
            <div className="flex flex-col h-48 border border-gray-200 p-4 rounded-lg bg-gray-50 print:bg-transparent">
              <h5 className="font-bold text-gray-900 text-center mb-6 uppercase">1. Employee</h5>
              <div className="space-y-4 flex-1">
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Name:</span>
                  <span className="text-gray-900 font-medium"></span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Designation:</span>
                  <span className="text-gray-900 font-medium"></span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Signature:</span>
                  <span></span>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-3 mt-auto">
                <span className="font-semibold text-gray-600">Date:</span>
                <span></span>
              </div>
            </div>

            {/* 2. Supervisor */}
            <div className="flex flex-col h-48 border border-gray-200 p-4 rounded-lg bg-gray-50 print:bg-transparent">
              <h5 className="font-bold text-gray-900 text-center mb-6 uppercase">2. Supervisor / Head of Unit</h5>
              <div className="space-y-4 flex-1">
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Name:</span>
                  <span></span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Designation:</span>
                  <span></span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Signature:</span>
                  <span></span>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-3 mt-auto">
                <span className="font-semibold text-gray-600">Date:</span>
                <span></span>
              </div>
            </div>

            {/* 3. MDA Representative */}
            <div className="flex flex-col h-48 border border-gray-200 p-4 rounded-lg bg-gray-50 print:bg-transparent">
              <h5 className="font-bold text-gray-900 text-center mb-6 uppercase">3. MDA Representative</h5>
              <div className="space-y-4 flex-1">
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Name:</span>
                  <span></span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Designation:</span>
                  <span></span>
                </div>
                <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                  <span className="font-semibold text-gray-600">Signature:</span>
                  <span></span>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-3 mt-auto">
                <span className="font-semibold text-gray-600">Date:</span>
                <span></span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-gray-400 print:text-black">
          <p>Generated by Taraba State Biometric Verification Portal</p>
          <p className="mt-1">Document Hash: {employee.id}</p>
        </div>

      </div>
    </div>
  );
}
