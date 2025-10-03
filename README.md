# Audience Intelligence Tool

**UNM_TECH_10032025**

**(Updated 10/03 - 5:46a)**

Hey there! Thanks for checking out our project for the HSI BOTB competition. We built this Audience Intelligence Tool to help marketing teams get a better grip on who their customers are. It takes client data and turns it into easy-to-understand audience segments and personas.

## What's under the hood?

We built this with a modern tech stack, which we think is pretty cool. Here's what we used:

*   **Frontend:** We used [Next.js](https://nextjs.org/) and [React](https://reactjs.org/) to build the user interface, and [Tailwind CSS](https://tailwindcss.com/) to make it look good without a lot of fuss.
*   **Backend:** The backend is powered by [Node.js](https://nodejs.org/) and [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction), which made it super easy to build out our API.
*   **Language:** We wrote everything in [TypeScript](https://www.typescriptlang.org/) because we like our code to be type-safe and easy to read.
*   **Other stuff:** We're using the [OpenAI](https://www.npmjs.com/package/openai) library to work some magic with the data, [js-yaml](https://www.npmjs.com/package/js-yaml) for handling YAML, and [Zod](https://zod.dev/) for data validation.

## Real-World Potential & Our Proof-of-Concept

In a real-world scenario, this tool would be even more powerful. We would use a custom, fine-tuned model to generate the audience segments and personas. This would have a few key advantages:

*   **Better Accuracy:** A fine-tuned model would be trained on a massive dataset of marketing case studies and customer profiles, allowing it to generate much more accurate and nuanced personas.
*   **Deeper Insights:** It would be able to pick up on subtle patterns and trends in the data that a general-purpose model might miss.
*   **Improved Sustainability and Privacy:** A fine-tuned model can be smaller and more efficient, which means it would be more sustainable to run. It could also be hosted on a private server, which would be a big plus for data privacy.

Given the 24-hour time constraint of this competition, we decided to use a more general-purpose model to power our proof-of-concept. It's not as powerful or sustainable as a fine-tuned model, but it gets the job done and shows what's possible. We're really excited about the potential of this tool and hope to continue developing it in the future.

## So, how do I use it?

The app is pretty straightforward. You'll see a form where you can paste in your client data. Hit submit, and our tool will work its magic and spit out a report with audience segments and personas. If you want to poke around in the code, the main frontend page is `app/page.tsx`, and the API routes are in the `app/api` directory.

## Getting it running

We've containerized the app with Docker to make it super easy to run. You'll need to have Docker and Docker Compose installed.

1.  Just run this script:

    ```bash
    ./run.sh
    ```

2.  This script will:
    *   Build the Docker image.
    *   Start the container.
    *   Wait a few seconds for everything to boot up.
    *   Check if the app is running by hitting our health check endpoint.

## Did it work?

You'll know the app started up correctly when you see this in your terminal:

```
Building Image...
...
Starting the application...
...
Waiting for startup...
Running an example curl to check app is working
{"status":"ok"}
```

Once you see that, you can open up your browser and head to [http://localhost:3000](http://localhost:3000) to see the app in action.

Thanks again for checking out our project! We had a lot of fun building it.