export default function Features() {
  const features = [
    {
      title: "Staff Registration",
      description: "Staff can submit their details through a guided registration flow."
    },
    {
      title: "Identity Verification",
      description: "The system verifies staff identity and supports validation of submitted information."
    },
    {
      title: "Track Application Status",
      description: "Applicants can check progress and see when their records are updated."
    },
    {
      title: "Secure Records",
      description: "Staff records are stored in a single secure system for authorized access."
    },
    {
      title: "Secure Access",
      description: "Logged-in staff can access their account securely."
    },
    {
      title: "Support Requests",
      description: "Users can reach the help desk for assistance with registration or access issues."
    }
  ];

  return (
    <section id="features" className="w-full bg-white py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>What the app does</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            The app handles the core staff workflow from registration to verification and record management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
