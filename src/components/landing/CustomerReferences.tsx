import { Card } from "@/components/ui/card";

const videos = [
  {
    title: "Indeed",
    embedUrl: "https://www.youtube.com/embed/dqqaEaoJpm8?start=5",
    description: "Indeed Accelerates Job Matches with Agentforce"
  },
  {
    title: "Adecco",
    embedUrl: "https://www.youtube.com/embed/FP4isLxKVBw?start=2",
    description: "The Adecco Group To Transform Its Hiring Process With Agentforce"
  }
];

const CustomerReferences = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Customer References
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how leading companies are transforming their operations with Agentforce
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {videos.map((video, index) => (
            <Card key={index} className="overflow-hidden border-border bg-card">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={video.embedUrl}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {video.title}
                </h3>
                <p className="text-muted-foreground">
                  {video.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReferences;
