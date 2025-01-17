"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";

import { config } from "~/components/providers/WagmiProvider";
import { PurpleButton } from "~/components/ui/PurpleButton";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";

const HORN_SOUNDS = [
  {
    name: "Classic Air Horn",
    url: "https://www.myinstants.com/media/sounds/air-horn-club-sample.mp3"
  },
  {
    name: "Train Horn",
    url: "https://www.myinstants.com/media/sounds/train-horn.mp3"
  },
  {
    name: "Party Horn",
    url: "https://www.myinstants.com/media/sounds/party-horn.mp3"
  },
  {
    name: "Fog Horn",
    url: "https://www.myinstants.com/media/sounds/foghorn.mp3"
  }
];

function SoundButton({ name, url }: { name: string; url: string }) {
  const playSound = () => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <PurpleButton onClick={playSound} className="w-full mb-2">
      {name}
    </PurpleButton>
  );
}

function SoundboardCard() {
  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-900">Air Horn Party 🎉</CardTitle>
        <CardDescription className="text-neutral-600">
          Press buttons to play different air horn sounds!
        </CardDescription>
      </CardHeader>
      <CardContent className="text-neutral-800">
        <div className="flex flex-col">
          {HORN_SOUNDS.map((sound) => (
            <SoundButton key={sound.url} name={sound.name} url={sound.url} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Frame(
  { title }: { title?: string } = { title: PROJECT_TITLE }
) {
  const appUrl = process.env.NEXT_PUBLIC_URL;
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_URL environment variable is not set');
  }

  // Add frame metadata
  useEffect(() => {
    const metaTags = [
      { property: 'fc:frame', content: 'vNext' },
      { property: 'fc:frame:image', content: `${appUrl}/icon.png` },
      { property: 'fc:frame:post_url', content: `${appUrl}/api/frame` },
      { property: 'og:image', content: `${appUrl}/icon.png` },
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });

    return () => {
      metaTags.forEach(tag => {
        const existing = document.querySelector(`meta[property="${tag.property}"]`);
        if (existing) {
          document.head.removeChild(existing);
        }
      });
    };
  }, [appUrl]);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-neutral-900">{title}</h1>
        <SoundboardCard />
      </div>
    </div>
  );
}
