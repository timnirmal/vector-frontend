import { Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

type ModalWithRadarChartProps = {
    selectedProspect: {
        first_name?: string | null;
        last_name?: string | null;
        work_email?: string | null;
        Direct_email?: string | null;
        phone_1?: string | null;
        phone_2?: string | null;
        job_Title?: string | null;
        seniority?: string | null;
        departments?: string | null;
        country?: string | null;
        continent?: string | null;
        linkedin_Url?: string | null;
        company_name?: string | null;
        company_domain?: string | null;
        company_description?: string | null;
        company_year_founded?: string | null;
        company_website?: string | null;
        company_number_of_employees?: string | null;
        company_revenue?: string | null;
        company_linkedin_URL?: string | null;
        company_specialities?: string | null;
        research_data?: string | null;
        budget_score?: number | null;
        authority_score?: number | null;
        need_score?: number | null;
        timeline_score?: number | null;
        final_analysis?: string | null;
    } | null;
    setIsDialogOpen: (open: boolean) => void;
};

const ModalWithRadarChart: React.FC<ModalWithRadarChartProps> = ({ selectedProspect, setIsDialogOpen }) => {
    if (!selectedProspect) return null;

    // Radar Chart Data
    const radarData = {
        labels: ["Budget", "Authority", "Need", "Timeline"],
        datasets: [
            {
                label: "Lead Qualification Scores",
                data: [
                    selectedProspect.budget_score ?? 0,
                    selectedProspect.authority_score ?? 0,
                    selectedProspect.need_score ?? 0,
                    selectedProspect.timeline_score ?? 0,
                ],
                backgroundColor: "rgba(54, 162, 235, 0.2)", // Light blue fill
                borderColor: "rgba(54, 162, 235, 1)", // Blue border
                borderWidth: 2,
                pointBackgroundColor: "rgba(54, 162, 235, 1)", // Blue points
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            },
        ],
    };

    // Chart Options
    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                grid: {
                    color: "rgba(128, 128, 128, 0.5)",
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: "top" as const, // Explicitly set to a valid literal type
            },
        },
    };


    return (
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-4">
                <DialogHeader>
                    <DialogTitle>
                        Full Details for {selectedProspect.first_name} {selectedProspect.last_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Radial Graph */}
                    <div className="w-full h-72 flex justify-center items-center bg-gray-100 p-4 rounded-md shadow-md">
                        <Radar data={radarData} options={radarOptions} />
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="font-semibold mb-2">Contact Information</h3>
                        <Separator />
                        <p><strong>Work Email:</strong> {selectedProspect.work_email || "N/A"}</p>
                        <p><strong>Direct Email:</strong> {selectedProspect.Direct_email || "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedProspect.phone_1 || selectedProspect.phone_2 || "N/A"}</p>
                        <p><strong>Job Title:</strong> {selectedProspect.job_Title || "N/A"}</p>
                        <p><strong>Seniority:</strong> {selectedProspect.seniority || "N/A"}</p>
                        <p><strong>Department:</strong> {selectedProspect.departments || "N/A"}</p>
                        <p><strong>Country:</strong> {selectedProspect.country || "N/A"}</p>
                        <p><strong>Continent:</strong> {selectedProspect.continent || "N/A"}</p>
                        <p>
                            <strong>LinkedIn:</strong>{" "}
                            {selectedProspect.linkedin_Url ? (
                                <a href={selectedProspect.linkedin_Url} target="_blank" rel="noopener noreferrer" className="underline">
                                    {selectedProspect.linkedin_Url}
                                </a>
                            ) : "N/A"}
                        </p>
                    </div>

                    {/* Company Information */}
                    <div>
                        <h3 className="font-semibold mb-2">Company Information</h3>
                        <Separator />
                        <p><strong>Company Name:</strong> {selectedProspect.company_name || "N/A"}</p>
                        <p><strong>Domain:</strong> {selectedProspect.company_domain || "N/A"}</p>
                        <p><strong>Description:</strong> {selectedProspect.company_description || "N/A"}</p>
                        <p><strong>Year Founded:</strong> {selectedProspect.company_year_founded || "N/A"}</p>
                        <p><strong>Employees:</strong> {selectedProspect.company_number_of_employees || "N/A"}</p>
                        <p><strong>Revenue:</strong> {selectedProspect.company_revenue || "N/A"}</p>
                        <p>
                            <strong>Website:</strong>{" "}
                            {selectedProspect.company_website ? (
                                <a href={selectedProspect.company_website} target="_blank" rel="noopener noreferrer" className="underline">
                                    {selectedProspect.company_website}
                                </a>
                            ) : "N/A"}
                        </p>
                    </div>

                    {/* BANT Scores */}
                    <div>
                        <h3 className="font-semibold mb-2">BANT Analysis</h3>
                        <Separator />
                        <p><strong>Budget Score:</strong> {selectedProspect.budget_score ?? "N/A"}</p>
                        <p><strong>Authority Score:</strong> {selectedProspect.authority_score ?? "N/A"}</p>
                        <p><strong>Need Score:</strong> {selectedProspect.need_score ?? "N/A"}</p>
                        <p><strong>Timeline Score:</strong> {selectedProspect.timeline_score ?? "N/A"}</p>
                        <p>
                            <strong>Final Analysis:</strong>{" "}
                            {selectedProspect.final_analysis ? (
                                <Badge className={selectedProspect.final_analysis.toLowerCase() === "qualified"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"}>
                                    {selectedProspect.final_analysis}
                                </Badge>
                            ) : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Close Button */}
            <div className="p-4 border-t flex justify-end">
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </div>
        </DialogContent>
    );
};

export default ModalWithRadarChart;
