const UnderGuidance = ({ mentors }) => {
  return (
    <section
      id="guidance"
      className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400" />

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Under the Guidance of
          </h2>

          <p className="mx-auto mt-4 max-w-3xl leading-7 text-blue-100">
            Our academy is privileged to be guided by distinguished educators
            whose decades of experience, academic leadership, and dedication to
            quality education continue to inspire our vision and strengthen our
            commitment to student success.
          </p>
        </div>

        {/* Mentor Cards */}
        <div className="grid gap-8 lg:grid-cols-2">

          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="rounded-[30px] border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300/40 hover:shadow-2xl hover:shadow-blue-900/30"
            >
              {/* Top */}
              <div className="flex flex-col items-center gap-6 sm:flex-row">

                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="h-36 w-36 rounded-full border-4 border-white object-cover shadow-xl ring-4 ring-blue-400/20"
                />

                <div className="flex-1 text-center sm:text-left">

                  <h3 className="text-2xl font-bold text-white">
                    {mentor.name}
                  </h3>

                  <p className="mt-2 text-blue-100">
                    {mentor.qualification}
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">

                    <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100">
                      {mentor.designation}
                    </span>

                    <span className="rounded-full bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-100">
                      {mentor.experience}
                    </span>

                  </div>

                </div>
              </div>

              {/* Divider */}
              <div className="my-7 h-px w-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

              {/* Organization */}
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-center text-sm font-medium text-blue-100">
                  {mentor.organization}
                </p>
              </div>

              {/* Story */}
              <p className="mt-6 leading-8 text-slate-200">
                {mentor.story}
              </p>

              {/* Bottom Quote */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-5">
                <p className="italic leading-7 text-blue-100">
                  &quot; Their invaluable guidance and decades of educational
                  excellence continue to shape the vision, values, and academic
                  standards of Innovative Academy. &quot;
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default UnderGuidance;