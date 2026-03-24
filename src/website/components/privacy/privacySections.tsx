import type { ReactNode } from "react";
import type { LandingLang } from "../../landingTranslations";

export type PrivacySection = {
  id: string;
  title: string;
  content: ReactNode;
};

const privacySectionsEn: PrivacySection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <p>
        FlatFlow is a Chrome browser extension designed to help users collect
        and organize real estate listing information from publicly available
        pages on myhome.ge. This Privacy Policy explains how the extension
        accesses, processes, and handles data while users interact with the
        extension.
      </p>
    ),
  },
  {
    id: "data-we-access",
    title: "2. Data We Access",
    content: (
      <>
        <p>
          FlatFlow may read publicly available content from real estate listing
          pages on myhome.ge. This information may include listing titles,
          property descriptions, images, prices, location information provided
          on the listing page, and other visible listing details.
        </p>
        <p>
          The extension only accesses information that is already visible to the
          user on the webpage being viewed.
        </p>
      </>
    ),
  },
  {
    id: "personal-data",
    title: "3. Personal Data",
    content: (
      <>
        <p>
          FlatFlow does not collect, store, or process personally identifiable
          information such as names, email addresses, phone numbers,
          authentication credentials, financial data, health data, or personal
          communications.
        </p>
        <p>
          The extension does not access private user accounts, login
          credentials, or any information that is not publicly available on the
          webpage.
        </p>
      </>
    ),
  },
  {
    id: "how-data-is-used",
    title: "4. How Data Is Used",
    content: (
      <>
        <p>
          The accessed website content is used exclusively to display property
          listing information inside the extension&apos;s interface (side
          panel).
        </p>
        <p>
          This allows users to easily review, organize, and manage property
          listings while browsing the myhome.ge website.
        </p>
        <p>
          The extension does not use this data for analytics, advertising,
          profiling, or any unrelated purposes.
        </p>
      </>
    ),
  },
  {
    id: "local-data-storage",
    title: "5. Local Data Storage",
    content: (
      <>
        <p>
          FlatFlow may store limited non-personal data locally in the
          user&apos;s browser using Chrome extension storage APIs. This data may
          include temporary listing information or user interface preferences.
        </p>
        <p>
          All stored data remains on the user&apos;s device and is not
          transmitted to any external servers.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "6. Data Sharing",
    content: (
      <>
        <p>
          FlatFlow does not transmit, sell, rent, or share any user data with
          third parties.
        </p>
        <p>
          All data processing occurs locally within the user&apos;s browser.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "7. Third-Party Services",
    content: (
      <>
        <p>
          FlatFlow does not integrate with third-party analytics platforms,
          advertising services, tracking tools, or external APIs.
        </p>
        <p>
          The extension operates independently and does not send data outside
          the user&apos;s browser.
        </p>
      </>
    ),
  },
  {
    id: "chrome-permissions",
    title: "8. Chrome Permissions",
    content: (
      <>
        <p>
          FlatFlow requires certain Chrome extension permissions in order to
          function properly:
        </p>
        <ul className="mt-4 list-none space-y-3">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                activeTab
              </strong>
              {" – "}to access the currently opened myhome.ge page.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                scripting
              </strong>
              {" – "}to read listing information from the webpage.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">tabs</strong>
              {" – "}to detect the active tab and supported pages.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">storage</strong>
              {" – "}to store temporary extension settings locally.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                sidePanel
              </strong>
              {" – "}to display the extension interface.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                host permissions
              </strong>
              {" – "}to access listing pages on myhome.ge.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          These permissions are used solely to provide the extension&apos;s
          functionality.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "9. Data Security",
    content: (
      <>
        <p>
          Because FlatFlow processes data locally within the user&apos;s browser
          and does not transmit data externally, the risk of external data
          exposure is minimized.
        </p>
        <p>
          No remote databases, servers, or third-party storage systems are used.
        </p>
      </>
    ),
  },
  {
    id: "user-control",
    title: "10. User Control",
    content: (
      <>
        <p>
          Users can disable or remove the FlatFlow extension at any time through
          the Chrome Extensions management page.
        </p>
        <p>
          Removing the extension will also remove any locally stored extension
          data.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "11. Changes to This Privacy Policy",
    content: (
      <>
        <p>
          This Privacy Policy may be updated from time to time in order to
          reflect changes to the extension or Chrome Web Store policies.
        </p>
        <p>
          Any updates will be posted on this page with an updated revision date.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "12. Contact Information",
    content: (
      <>
        <p>
          If you have any questions regarding this Privacy Policy or the
          FlatFlow extension, you may contact the developer at:
        </p>
        <p className="mt-3">
          <a
            href="mailto:lmadurashvili99@gmail.com"
            className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary"
          >
            lmadurashvili99@gmail.com
          </a>
        </p>
      </>
    ),
  },
];

const privacySectionsKa: PrivacySection[] = [
  {
    id: "introduction",
    title: "1. შესავალი",
    content: (
      <p>
        FlatFlow არის Chrome-ის ბრაუზერის გაფართოება, რომელიც ეხმარება
        მომხმარებლებს myhome.ge-ზე საჯაროდ ხელმისაწვდომ გვერდებზე არსებული
        უძრავი ქონების განცხადებების ინფორმაციის შეგროვებასა და გამართვაში. ეს
        კონფიდენციალურობის პოლიტიკა ხსნის, როგორ ხდება გაფართოების მიერ
        მონაცემებზე წვდომა, დამუშავება და მართვა მომხმარებლისთვის გაფართოებასთან
        მუშაობისას.
      </p>
    ),
  },
  {
    id: "data-we-access",
    title: "2. მონაცემები, რომლებზეც ხდება წვდომა",
    content: (
      <>
        <p>
          FlatFlow შეიძლება წაიკითხოს საჯარო კონტენტი myhome.ge-ის უძრავი
          ქონების განცხადების გვერდებიდან. ინფორმაცია შეიძლება მოიცავდეს
          განცხადების სათაურებს, აღწერებს, სურათებს, ფასებს, განცხადების გვერდზე
          მითითებულ ლოკაციას და სხვა ხილულ დეტალებს.
        </p>
        <p>
          გაფართოება მხოლოდ იმ ინფორმაციას ხელს უწვდება, რაც მომხმარებლისთვის
          უკვე ხილულია იმ ვებგვერდზე, რომელსაც იგი ნახულობს.
        </p>
      </>
    ),
  },
  {
    id: "personal-data",
    title: "3. პერსონალური მონაცემები",
    content: (
      <>
        <p>
          FlatFlow არ აგროვებს, ინახავს და არ ამუშავებს პერსონალურად
          იდენტიფიცირებად ინფორმაციას, როგორებიცაა სახელი, ელფოსტა, ტელეფონის
          ნომერი, ავთენტიკაციის მონაცემები, ფინანსური ან ჯანმრთელობის მონაცემები
          ან პირადი კომუნიკაცია.
        </p>
        <p>
          გაფართოება არ ხსნის მომხმარებლის პირად ანგარიშებს, შესვლის
          იდენტიფიკატორებს ან ინფორმაციას, რომელიც ვებგვერდზე საჯაროდ არ არის
          ხელმისაწვდომი.
        </p>
      </>
    ),
  },
  {
    id: "how-data-is-used",
    title: "4. როგორ გამოიყენება მონაცემები",
    content: (
      <>
        <p>
          წვდომილი ვებგვერდის კონტენტი გამოიყენება მხოლოდ განცხადების
          ინფორმაციის საჩვენებლად გაფართოების ინტერფეისში (გვერდით პანელში).
        </p>
        <p>
          ეს საშუალებას აძლევს მომხმარებელს, მარტივად გადახედოს, დაალაგოს და
          მართოს განცხადებები myhome.ge-ზე სარგებლობისას.
        </p>
        <p>
          გაფართოება არ იყენებს ამ მონაცემებს ანალიტიკისთვის, რეკლამისთვის,
          პროფილირებისთვის ან სხვა დანიშნულებით.
        </p>
      </>
    ),
  },
  {
    id: "local-data-storage",
    title: "5. ლოკალური შენახვა",
    content: (
      <>
        <p>
          FlatFlow შეიძლება შეზღუდულად შეინახოს არაპერსონალური მონაცემები
          ლოკალურად მომხმარებლის ბრაუზერში Chrome-ის გაფართოების საცავის
          API-ების საშუალებით — მაგალითად, დროებითი განცხადების მონაცემები ან
          ინტერფეისის პარამეტრები.
        </p>
        <p>
          შენახული მონაცემები რჩება მომხმარებლის მოწყობილობაზე და არ გადაიცემა
          გარე სერვერებზე.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "6. მონაცემების გაზიარება",
    content: (
      <>
        <p>
          FlatFlow არ აგზავნის, არ ყიდის, არ ქირაობს და არ უზიარებს მომხმარებლის
          მონაცემებს მესამე მხარეებს.
        </p>
        <p>მონაცემთა დამუშავება ხდება ლოკალურად მომხმარებლის ბრაუზერში.</p>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "7. მესამე მხარის სერვისები",
    content: (
      <>
        <p>
          FlatFlow არ ერთიანდება მესამე მხარის ანალიტიკურ პლატფორმებთან,
          რეკლამის სერვისებთან, თვალთვალის ხელსაწყოებთან ან გარე API-ებთან.
        </p>
        <p>
          გაფართოება მუშაობს დამოუკიდებლად და არ გზავნის მონაცემებს მომხმარებლის
          ბრაუზერის გარეთ.
        </p>
      </>
    ),
  },
  {
    id: "chrome-permissions",
    title: "8. Chrome-ის ნებართვები",
    content: (
      <>
        <p>
          FlatFlow-ს სჭირდება Chrome-ის გარკვეული ნებართვები სწორად სამუშაოდ:
        </p>
        <ul className="mt-4 list-none space-y-3">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                activeTab
              </strong>
              {" – "}ამჟამად გახსნილ myhome.ge-ის გვერდზე წვდომისთვის.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                scripting
              </strong>
              {" – "}განცხადების ინფორმაციის წასაკითხად ვებგვერდიდან.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">tabs</strong>
              {" – "}აქტიური ჩანართისა და მხარდაჭერილი გვერდების გამოსავლენად.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">storage</strong>
              {" – "}გაფართოების დროებითი პარამეტრების ლოკალურად შესანახად.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                sidePanel
              </strong>
              {" – "}გაფართოების ინტერფეისის საჩვენებლად.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                host permissions
              </strong>
              {" – "}myhome.ge-ის განცხადების გვერდებზე წვდომისთვის.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          ეს ნებართვები გამოიყენება მხოლოდ გაფართოების ფუნქციონალის
          უზრუნველყოფისთვის.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "9. მონაცემების უსაფრთხოება",
    content: (
      <>
        <p>
          რადგან FlatFlow ამუშავებს მონაცემებს ლოკალურად მომხმარებლის ბრაუზერში
          და არ გადასცემს მათ გარეთ, გარე გაჟონვის რისკი მინიმალურია.
        </p>
        <p>
          არ გამოიყენება დისტანციური ბაზები, სერვერები ან მესამე მხარის საცავის
          სისტემები.
        </p>
      </>
    ),
  },
  {
    id: "user-control",
    title: "10. მომხმარებლის კონტროლი",
    content: (
      <>
        <p>
          მომხმარებელს ნებისმიერ დროს შეუძლია გათიშოს ან წაშალოს FlatFlow
          Chrome-ის გაფართოებების მართვის გვერდიდან.
        </p>
        <p>გაფართოების წაშლა ასევე წაშლის ლოკალურად შენახულ მონაცემებს.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "11. ცვლილებები ამ კონფიდენციალურობის პოლიტიკაში",
    content: (
      <>
        <p>
          ეს კონფიდენციალურობის პოლიტიკა დროდადროს შეიძლება განახლდეს
          გაფართოების ან Chrome Web Store-ის მოთხოვნების ცვლილების საპასუხოდ.
        </p>
        <p>
          ნებისმიერი განახლება გამოქვეყნდება ამ გვერდზე განახლებული თარიღით.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "12. საკონტაქტო ინფორმაცია",
    content: (
      <>
        <p>
          ამ კონფიდენციალურობის პოლიტიკასთან ან FlatFlow-ის გაფართოებასთან
          დაკავშირებული კითხვების შემთხვევაში დეველოპერთან დაკავშირება
          შეგიძლიათ:
        </p>
        <p className="mt-3">
          <a
            href="mailto:lmadurashvili99@gmail.com"
            className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary"
          >
            lmadurashvili99@gmail.com
          </a>
        </p>
      </>
    ),
  },
];

const byLang = {
  en: privacySectionsEn,
  ka: privacySectionsKa,
} as const;

export function getPrivacySections(lang: LandingLang): PrivacySection[] {
  return byLang[lang];
}
