import React, { useEffect, useMemo, useState } from "react";
import TeamMemberCard from "./TeamMemberCard";
import { any } from "zod";

const TeamSliderSection = ({
  title,
  subtitle,
  members,
  direction = "left",
  speed = 40,
}) => {
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  const shouldAnimate = members.length > visibleCards;

  const duplicatedMembers = useMemo(() => {
    return shouldAnimate ? [...members, ...members] : members;
  }, [members, shouldAnimate]);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

       {title && (
  <div className="mb-10 text-center">
    <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
      {title}
    </h2>

    {subtitle && (
      <p className="mx-auto mt-4 max-w-2xl text-slate-600 leading-7">
        {subtitle}
      </p>
    )}
  </div>
)}

        {!shouldAnimate ? (
          <div className="flex flex-wrap justify-center gap-6">
            {members.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-hidden py-4">
            <div
              className={`flex w-max gap-6 ${
                direction === "right"
                  ? "team-marquee-right"
                  : "team-marquee-left"
              }`}
              style={{
                animationDuration: `${speed}s`,
              }}
            >
              {duplicatedMembers.map((member, index) => (
                <TeamMemberCard
                  key={`${member.name}-${index}`}
                  member={member}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSliderSection;