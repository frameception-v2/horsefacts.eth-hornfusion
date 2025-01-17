import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOiA4ODcyNDYsICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4N0Q0MDBGRDFGNTkyYkI0RkNkNmEzNjNCZkQyMDBBNDNEMTY3MDRlNyJ9",
      payload: "eyJkb21haW4iOiAiaG9yc2VmYWN0c2V0aC1ob3JuZnVzaW9uLnZlcmNlbC5hcHAifQ",
      signature: "0Pf_MsUuy45rHiAiVslBw2R3JBcq3-xAypdt7dfLqm10BvfpnQ3NH6nybyzq0lA3ebZfiZjrxFhk4aXY463LHBw"
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
