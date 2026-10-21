import React from "react";

const TeamMemberCard = ({ member }) => {
  return (
    <div className="group w-[255px] sm:w-[265px] flex-shrink-0 rounded-3xl border border-purple-100 bg-white px-6 py-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">

      {/* Image */}
      <div className="flex justify-center">
        <div className="rounded-full border-4 border-white ring-2 ring-purple-100 shadow-md">
         
            <div className="h-28 w-28 overflow-hidden rounded-full sm:h-32 sm:w-32">
            <img
              src={member.image}
              alt={member.name}
              className="h-full  w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="mt-5 text-center">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {member.name}
        </h3>

        {/* Divider */}
        <div className="mx-auto my-3 h-[2px] w-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full " />

        {/* Qualification */}
        {member.qualification && (
          <p className="text-sm font-medium text-slate-500">
            {member.qualification}
          </p>
        )}

        {/* Designation Badge */}
        <div className="mt-4">
          <span className="inline-flex rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-1 text-xs font-semibold text-purple-700">
            {member.designation}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;