import { useState } from "react";
import { useApp } from "../context/AppContext";
import Card from "../components/Card";
import Button from "../components/Button";

export default function Dashboard() {
  const {
    user,
    grantOffers,
    fundRequests,
    fundRequests: myRequests,
    applyToGrant,
    fundProjectDirectly,
  } = useApp();
  const [selectedGrant, setSelectedGrant] = useState(null);

  // SCIENTIST VIEW
  if (user.role === "scientist") {
    const handleApply = (grantId) => {
      const myProject = prompt(
        "Enter the Project ID you want to submit (Available IDs: " +
          myRequests
            .filter((r) => r.scientistId === user.id)
            .map((r) => r.id)
            .join(", ") +
          ")"
      );

      // Note: In real app, use a modal/dropdown.
      const projectExists = myRequests.find(
        (r) => r.id === Number(myProject) && r.scientistId === user.id
      );

      if (projectExists) {
        const grant = grantOffers.find((g) => g.id === grantId);
        applyToGrant(grantId, Number(myProject), grant.companyId);
      } else {
        alert("Invalid Project ID or not owned by you.");
      }
    };

    return (
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">Available Grants</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {grantOffers.length === 0 && (
            <p className="text-slate-500">No grants available yet.</p>
          )}
          {grantOffers.map((grant) => (
            <Card key={grant.id} className="flex flex-col justify-between">
              <div>
                <div className="text-violet-400 text-sm mb-2">
                  Offer by {grant.companyName}
                </div>
                <h3 className="text-xl font-bold mb-2">{grant.title}</h3>
                <p className="text-slate-400 mb-4">{grant.description}</p>
              </div>
              <Button onClick={() => handleApply(grant.id)} variant="secondary">
                Apply for Funding
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // COMPANY VIEW
  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-8">Project Fund Requests</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fundRequests.length === 0 && (
          <p className="text-slate-500">No requests posted yet.</p>
        )}
        {fundRequests.map((req) => (
          <Card key={req.id} className="flex flex-col justify-between">
            <div>
              <div className="text-blue-400 text-sm mb-2">
                Scientist: {req.scientistName}
              </div>
              <h3 className="text-xl font-bold mb-2">{req.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                {req.description}
              </p>
              <div className="bg-slate-950 p-3 rounded-lg mb-4 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Needed:</span>
                  <span className="font-bold text-green-400">
                    ${req.totalFunding}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => fundProjectDirectly(req.id)}
              variant="primary"
            >
              Fund This Project
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
