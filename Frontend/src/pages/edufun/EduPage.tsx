import React from "react";
import RootLayout from "./layout";
import HomePage from "./page"; // Assuming this is the Hedera lesson home
import Intro from "../../components/Intro";

const EdufunPage: React.FC = () => {
  return (
    <>
      <Intro title={"EduFun"} color={"purple"} />
      <RootLayout>
        <HomePage />
      </RootLayout>
    </>
  );
};

export default EdufunPage;
