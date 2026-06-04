import { useEffect } from "react";

const AdminRedirect = () => {
  useEffect(() => {
    window.location.href =
      "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/admin3.html";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">
          Redirecting to Admin Dashboard...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          If not redirected,{" "}
          <a
            href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/admin3.html"
            className="text-orange-500 underline font-semibold"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminRedirect;