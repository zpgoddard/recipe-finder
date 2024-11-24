# README

It's dinner time! Create an application that helps users find the most relevant recipes that they can prepare with the ingredients that they have at home.

## Deployed App

[See it in action here!](https://recipe-finder-pennylane-beac36736783.herokuapp.com/)

### How to Use

1. Enter your ingredient into the input bar at the top of the screen.
2. Press Enter or click the "+" button to add it to your list of ingredients (ingredients must be at least 3 characters).
3. Click on an ingredient to remove it from the list.
4. Click the "Find Recipes" button to search for recipes that match your ingredients:
   - Recipes with the highest match percentage appear first. For example: A 5/5 match is 100%, whereas a 4/5 match is 80%.
   - If multiple recipes have the same match percentage, they are ordered by the number of your ingredients they match with.
   - Remaining conflicts are resolved by the least number of missing ingredients.
5. Click on a recipe to expand it and view more details; ingredients that match will be highlighted.

## User Stories

1. As a user I am able to enter multiple ingredients that I currently have available to me.
2. As a user I am able to search for recipes that are most relevant to the ingredients I have.
3. As a user I am able to see a list of those recipes, and choose one to find more details about.

## Prerequisites

Before starting, ensure you have the following installed:

- **Ruby**: `3.x.x`
- **Rails**: `8.x.x`
- **Node.js**: `14.x.x`
- **Yarn**: `1.x.x`
- **PostgreSQL**: `12.x.x`

## Installation

### Install Dependencies

Run the following commands to install dependencies:

```bash
bundle install
yarn install
```

### Database Setup

Set up the database by running:

```bash
rails db:create
rails db:migrate
rails db:seed
```

## Running the Application

Start the server with:

```bash
rails s
```

Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

### Additional: Precompile Assets

If needed, precompile the assets using:

```bash
bundle exec rake assets:precompile
```

## Read More

Follow [this link](https://www.notion.so/Recipe-Finding-App-143d74cc76a480c09e84d17728ef2c78?showMoveTo=true&saveParent=true) to read about my approach to this challenge.
